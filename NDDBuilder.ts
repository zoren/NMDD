import NMDDBuilder from "./NMDDBuilder";

export default class NDDBuilder extends NMDDBuilder {
    public static And = (bs: boolean[]) => bs[0] && bs[1];
    public static Or = (bs: boolean[]) => bs[0] || bs[1];

    constructor(domainSizes: number[]) {
        super(2, domainSizes);
    }

    public ApplyBoolean(op: (_: boolean[]) => boolean, givenNodes: number[]) {
        return this.ApplyN((ns) => op(ns.map(n => n === 1)) ? 1 : 0, givenNodes);
    }

    public Exists(x: number, t: number) {
        let or = (u: number, v: number) => this.ApplyBoolean((bs: boolean[]) => bs[0] || bs[1], [u, v]);
        return this.getDomainValues(x).map((v) => this.Restrict(t, x, v)).reduce(or);
    }
}
