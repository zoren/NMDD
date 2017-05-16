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

    it("should return terminal 0", () => {
        expect(b.Make(0, [0, 0])).toBe(0);
    });

    it("should return terminal 1", () => {
        expect(b.Make(0, [1, 1])).toBe(1);
    });

    it("should", () => {
        let n1 = b.Make(0, [0, 1]);
        let n2 = b.Make(0, [1, 0]);
        let r = b.ApplyN((ns) => ns[0] === 1 && ns[1] === 1 ? 1 : 0, [n1, n2]);
        expect(r).toBe(0);
    });

});
