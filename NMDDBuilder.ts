type Entry = { var: number, children?: number[] };

function toString(v: number, children: number[]) {
    return v + " " + children.map(i => i.toString()).join(", ");
}

function memoizeString<T, U>(f: (rec: (t: T) => U, t: T) => U, xtoString: (x: T) => string): (t: T) => U {
    let cache = new Map<string, U>();
    function r(x: T): U {
        let s = xtoString(x);
        let res = cache.get(s);
        if (res) {
            return res;
        }
        res = f(r, x);
        cache.set(s, res);
        return res;
    }
    return r;
}

type VarIndex = number
type ValueIndex = number
type NodeIndex = number

export default class NMDDBuilder {
    private domainSizes: number[];
    private nodes: Entry[];
    private hash = new Map<string, number>();
    constructor(private readonly terminals: number, domainSizes: number[]) {
        if (terminals < 2) {
            throw new Error("number of terminals should be greater than or equal to 2");
        }
        domainSizes.forEach(ds => {
            if (ds < 2) { throw new Error(`domain size should be greater than or equal to 2: ${ds}`); }
        });
        this.domainSizes = domainSizes;
        let n = domainSizes.length;
        let nodes = [];
        for (let i = 0; i < terminals; i++) {
            nodes.push({ var: n });
        }
        this.nodes = nodes;
    }

    public Make(i: number, children: number[]): number {
        this.checkVar(i);
        children.forEach(this.checkNode);
        let domainSize = this.domainSizes[i];
        if (domainSize !== children.length) {
            throw new Error(`arity mismatch var has ${domainSize} values, got ${children.length}`);
        }
        return this.make(i, children);
    }

    public ApplyN = (op: (_: number[]) => number, givenNodes: number[]) => {
        if (givenNodes.length === 0) {
            throw new Error("expected more than zero nodes");
        }
        givenNodes.forEach(this.checkNode);
        let app = (recur: ((t: number[]) => number), us: number[]) => {
            if (us.every(u => u < this.terminals)) {
                return op(us);
            }
            let minVar = us.reduce((x, y) => Math.min(this.nodes[x].var, this.nodes[y].var));
            let values = this.getDomainValues(minVar);
            let nodes =
                values.map(value => recur(us.map(u => {
                    let n = this.nodes[u];
                    let c = n.children as number[];
                    return n.var === minVar ? c[value] : u;
                })));
            return this.make(minVar, nodes);
        };
        return memoizeString(app, (numbers: number[]) => numbers.join())(givenNodes);
    }

    public Eval = (env: number[], root: number): number => {
        if (env.length !== this.domainSizes.length) {
            throw new Error("env does not conver all variables");
        }
        this.domainSizes.forEach((ds, i) => {
            if (typeof env[i] !== "number" || env[i] >= ds) {
                throw new Error(`value ${env[i]} for var ${i} outside domain ${ds}`);
            }
        });
        let evalEnv = (recur: (_: number) => number, t: number) => {
            if (t < this.terminals) {
                return t;
            }
            let n = this.nodes[t];
            let vl = env[n.var];
            let c = n.children as number[];
            return recur(c[vl]);
        };
        return memoizeString(evalEnv, (n: number) => n.toString(16))(root);
    }

    public Restrict = (outerU: NodeIndex, j: VarIndex, b: ValueIndex) => {
        this.checkNode(outerU);
        this.checkVar(j);
        this.checkValue(j, b);
        let res = (recur: (_: number) => number, u: NodeIndex) => {
            let n = this.nodes[u];
            let c = n.children as number[];
            if (n.var > j) {
                return u;
            }
            if (n.var < j) {
                return this.make(n.var, c.map(recur));
            }
            return recur(c[b]);
        };
        return memoizeString(res, (n: number) => n.toString(16));
    }

    private make(i: number, children: number[]) {
        let firstChild = children[0];
        if (children.every(c => c === firstChild)) {
            return firstChild;
        }
        let s = toString(i, children);
        let v = this.hash.get(s);
        if (v) {
            return v;
        }
        let u = this.nodes.length;
        this.nodes.push({ var: i, children });
        this.hash.set(s, u);
        return u;
    }

    private checkVar = (i: number) => {
        if (i < 0 || i >= this.domainSizes.length) {
            throw new Error(`variable ${i} not defined`);
        }
    }

    private checkValue = (i: number, v: number) => {
        if (v < 0 || v >= this.domainSizes[i]) {
            throw new Error(`value ${v} outside domain for variable ${i}`);
        }
    }

    private checkNode = (n: number) => {
        if (n < 0 || n >= this.nodes.length) {
            throw new Error(`node ${n} not defined`);
        }
    }

    private getDomainValues = (n: number) => {
        let res: number[] = [];
        for (let i = 0; i < this.domainSizes[n]; i++) {
            res.push(i);
        }
        return res;
    }
}
