import NMDDBuilder from "../NMDDBuilder";

describe("single variable BDD", () => {
    let b: NMDDBuilder;
    beforeEach(() => b = new NMDDBuilder(2, [2]));
    it("should throw arity mismatch", () => {
        expect(() => b.Make(0, [])).toThrowError(/arity mismatch.*/);
    });

    it("should return new node", () => {
        expect(b.Make(0, [0, 1])).toBe(2);
    });

    it("should return same node", () => {
        let n = b.Make(0, [0, 1]);
        expect(b.Make(0, [0, 1])).toBe(n);
    });

    it("should return different node", () => {
        b.Make(0, [0, 1]);
        expect(b.Make(0, [1, 0])).toBe(3);
    });

});
