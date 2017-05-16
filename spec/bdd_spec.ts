import NMDDBuilder from "../NMDDBuilder";

describe("two variable BDD", () => {
    let b: NMDDBuilder;
    beforeEach(() => b = new NMDDBuilder(2, [2, 2]));
    it("should reflect truth table of conjunction", () => {
        let n1 = b.Make(0, [0, 1]);
        let n2 = b.Make(1, [0, 1]);
        let n = b.ApplyN(ns => ns[0] === 1 && ns[1] === 1 ? 1 : 0, [n1, n2]);
        expect(b.Eval([0, 0], n)).toBe(0);
        expect(b.Eval([0, 1], n)).toBe(0);
        expect(b.Eval([1, 0], n)).toBe(0);
        expect(b.Eval([1, 1], n)).toBe(1);
    });
});
