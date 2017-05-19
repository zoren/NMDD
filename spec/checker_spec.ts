import NDDBuilder from "../NDDBuilder";
import Checker from "../Checker";

describe("checker two vars", () => {
    let checker = new Checker([2, 2, 2, 2]);
    it("return", () => {
        let b = checker.builder;
        // initial state: x:0, y: 0
        // rules:
        // x = 0, y = 0 ? x := 1, y := 1
        // b.x = 0, a.x = 1, b.y = 0, a.y = 1
        let I = b.ApplyBoolean(NDDBuilder.And, [b.Make(0, [1, 0]), b.Make(2, [1, 0])]);
        let T1 = b.ApplyBoolean(NDDBuilder.And, [b.Make(0, [1, 0]), b.Make(1, [0, 1])]);
        let T2 = b.ApplyBoolean(NDDBuilder.And, [b.Make(2, [1, 0]), b.Make(3, [0, 1])]);
        let T = b.ApplyBoolean(NDDBuilder.And, [T1, T2]);
        let n = checker.ReachableStates(I, T, [0, 2], [1, 3]);
        let test = (ns: number[], expectedValue: number) =>
            expect(b.EvalPartialEnv([ns[0], undefined, ns[1], undefined], n)).toBe(expectedValue, ns.join(""));
        test([0, 0], 1);
        test([0, 1], 0);
        test([1, 0], 0);
        test([1, 1], 1);
    });
});
