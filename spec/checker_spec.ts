import NDDBuilder from "../NDDBuilder";
import Checker from "../Checker";

describe("checker two vars", () => {
    let checker = new Checker([2, 2, 2, 2]);
    let b = checker.builder;

    it("a single rule can be applied", () => {
        // initial state: x:0, y: 0
        // rules:
        // x = 0, y = 0 ? x := 1, y := 1
        // b.x = 0, a.x = 1, b.y = 0, a.y = 1
        let I = b.ApplyBoolean(NDDBuilder.And, [b.Make(0, [1, 0]), b.Make(2, [1, 0])]);
        let T = b.ApplyBoolean(NDDBuilder.And, [b.Make(0, [1, 0]), b.Make(1, [0, 1]), b.Make(2, [1, 0]), b.Make(3, [0, 1])]);
        let n = checker.ReachableStates(I, T, [0, 2], [1, 3]);
        let test = (ns: number[], expectedValue: number) =>
            expect(b.EvalPartialEnv([ns[0], undefined, ns[1], undefined], n)).toBe(expectedValue, ns.join(""));
        test([0, 0], 1);
        test([0, 1], 0);
        test([1, 0], 0);
        test([1, 1], 1);
    });

    it("two rules can be applied", () => {
        // initial state: x:0, y: 0
        // rules:
        // x = 0, y = 0 ? x := 1, y := 0
        // b.x = 0, a.x = 1, b.y = 0, a.y = 0
        // x = 1, y = 0 ? x := 1, y := 1
        // b.x = 1, a.x = 1, b.y = 0, a.y = 1        
        let I = b.ApplyBoolean(NDDBuilder.And, [b.Make(0, [1, 0]), b.Make(2, [1, 0])]);
        let T =
            b.ApplyBoolean(NDDBuilder.Or,
                [
                    b.ApplyBoolean(NDDBuilder.And, [b.Make(0, [1, 0]), b.Make(1, [0, 1]), b.Make(2, [1, 0]), b.Make(3, [1, 0])]),
                    b.ApplyBoolean(NDDBuilder.And, [b.Make(0, [0, 1]), b.Make(1, [0, 1]), b.Make(2, [1, 0]), b.Make(3, [0, 1])]),
                ]);
        let n = checker.ReachableStates(I, T, [0, 2], [1, 3]);
        let test = (ns: number[], expectedValue: number) =>
            expect(b.EvalPartialEnv([ns[0], undefined, ns[1], undefined], n)).toBe(expectedValue, ns.join(""));
        test([0, 0], 1);
        test([0, 1], 0);
        test([1, 0], 1);
        test([1, 1], 1);
    });

    function create<T>(l: number, f: (_: number) => T): T[] {
        let res: T[] = [];
        for (let i = 0; i < l; i++) {
            res.push(f(i));
        }
        return res;
    }

    function mkEq(v1: VarIndex, v2: VarIndex) {
        let ds1 = b.GetDomainSize(v1);
        let ds2 = b.GetDomainSize(v2);
        let ar = [];
        for (let i = 0; i < Math.min(ds1, ds2); i++) {
            let c1 = create(ds1, j => i === j ? 1 : 0);
            let c2 = create(ds2, j => i === j ? 1 : 0);
            let n = b.ApplyBoolean(NDDBuilder.And, [b.Make(v1, c1), b.Make(v2, c2)]);
            ar.push(n);
        }
        return b.ApplyBoolean(NDDBuilder.Or, ar);
    }

    it("when rules can be used in any order we cover entire state space", () => {
        // initial state: x:0, y: 0
        // rules:
        // x = 0 ? x := 1
        // b.x = 0, a.x = 1, b.y = a.y
        // y = 0 ? y := 1
        // b.x = a.x, b.y = 0, a.y = 1        
        let I = b.ApplyBoolean(NDDBuilder.And, [b.Make(0, [1, 0]), b.Make(2, [1, 0])]);
        let T =
            b.ApplyBoolean(NDDBuilder.Or,
                [
                    b.ApplyBoolean(NDDBuilder.And, [b.Make(0, [1, 0]), b.Make(1, [0, 1]), mkEq(2, 3)]),
                    b.ApplyBoolean(NDDBuilder.And, [mkEq(0, 1), b.Make(2, [1, 0]), b.Make(3, [0, 1])]),
                ]);
        let n = checker.ReachableStates(I, T, [0, 2], [1, 3]);
        let test = (ns: number[], expectedValue: number) =>
            expect(b.EvalPartialEnv([ns[0], undefined, ns[1], undefined], n)).toBe(expectedValue, ns.join(""));
        test([0, 0], 1);
        test([0, 1], 1);
        test([1, 0], 1);
        test([1, 1], 1);
    });
});
