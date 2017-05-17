import BDDBuilder from "../BDDBuilder";

describe("two variable BDD", () => {
    let b: BDDBuilder;
    beforeEach(() => b = new BDDBuilder(2));

    it("should throw on incomplete env", () => {
        let n1 = b.Make(0, [0, 1]);
        let n2 = b.Make(1, [0, 1]);
        let n = b.ApplyN(ns => ns[0] === 1 && ns[1] === 1 ? 1 : 0, [n1, n2]);
        expect(() => b.Eval([0], n)).toThrow();
    });

    it("should throw on value outside domain", () => {
        let n1 = b.Make(0, [0, 1]);
        let n2 = b.Make(1, [0, 1]);
        let n = b.ApplyN(ns => ns[0] === 1 && ns[1] === 1 ? 1 : 0, [n1, n2]);
        expect(() => b.Eval([0, 2], n)).toThrow();
    });

    it("should throw on value not number", () => {
        let n1 = b.Make(0, [0, 1]);
        let n2 = b.Make(1, [0, 1]);
        let n = b.ApplyN(ns => ns[0] === 1 && ns[1] === 1 ? 1 : 0, [n1, n2]);
        expect(() => b.Eval([0, undefined] as number[], n)).toThrow();
    });

    it("should reflect truth table of conjunction", () => {
        let n1 = b.Make(0, [0, 1]);
        let n2 = b.Make(1, [0, 1]);
        let n = b.ApplyBoolean(BDDBuilder.And, [n1, n2]);
        expect(b.Eval([0, 0], n)).toBe(0);
        expect(b.Eval([0, 1], n)).toBe(0);
        expect(b.Eval([1, 0], n)).toBe(0);
        expect(b.Eval([1, 1], n)).toBe(1);
    });

    it("restrict should return terminals when all vars are restricted", () => {
        let n = b.Make(0, [0, 1]);
        let r = b.Restrict(n, 0, 0);
        expect(r).toBe(0);
    });

    it("restrict should return node when greater var is restricted", () => {
        let n1 = b.Make(0, [0, 1]);
        let n2 = b.Make(1, [0, 1]);
        let n = b.ApplyBoolean(BDDBuilder.And, [n1, n2]);
        let r = b.Restrict(n, 1, 1);
        expect(r).toBe(n1);
    });

    it("restrict should return node when lesser var is restricted", () => {
        let n1 = b.Make(0, [0, 1]);
        let n2 = b.Make(1, [0, 1]);
        let n = b.ApplyBoolean(BDDBuilder.And, [n1, n2]);
        let r = b.Restrict(n, 0, 1);
        expect(r).toBe(n2);
    });
});
