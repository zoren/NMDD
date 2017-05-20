import NDDBuilder from "../NDDBuilder";
import NamedBuilder from "../NamedBuilder";

describe("named builder", () => {
    let vars = new Map<VariableName, Set<ValueName>>([["x", new Set(["false", "true"])]]);

    it("should throw on duplicates in variable order", () => {
        let varOrder = ["x", "x"];
        expect(() => new NamedBuilder(vars, varOrder)).toThrow();
    });

    it("should throw on undefined vars in variable order", () => {
        let varOrder = ["x", "y"];
        expect(() => new NamedBuilder(vars, varOrder)).toThrow();
    });

    it("should throw on variable not defined in order", () => {
        let varOrder: VariableName[] = [];
        expect(() => new NamedBuilder(vars, varOrder)).toThrow();
    });

    it("should throw on variable not defined in order 2", () => {
        let varOrder: VariableName[] = ["z"];
        expect(() => new NamedBuilder(vars, varOrder)).toThrow();
    });

    it("should throw on singleton domain", () => {
        let varsSingleton = new Map<VariableName, Set<ValueName>>([["x", new Set(["false"])]]);
        let varOrder: VariableName[] = ["x"];
        expect(() => new NamedBuilder(varsSingleton, varOrder)).toThrow();
    });

    it("should throw on empty domain", () => {
        let varsEmpty = new Map<VariableName, Set<ValueName>>([["x", new Set()]]);
        let varOrder: VariableName[] = ["x"];
        expect(() => new NamedBuilder(varsEmpty, varOrder)).toThrow();
    });

    it("should support MakeEq", () => {
        let varOrder: VariableName[] = ["x"];
        let nb = new NamedBuilder(vars, varOrder);
        let n = nb.MakeEq("x", "false");
        expect(nb.EvalPartialEnv(new Map<VariableName, ValueName>([["x", "false"]]), n)).toBe(1);
        expect(nb.EvalPartialEnv(new Map<VariableName, ValueName>([["x", "true"]]), n)).toBe(0);
    });

    it("should support ApplyBoolean", () => {
        let varOrder: VariableName[] = ["x", "y"];
        let twoVars = new Map<VariableName, Set<ValueName>>([["x", new Set(["f", "t"])], ["y", new Set(["f", "t"])]]);
        let nb = new NamedBuilder(twoVars, varOrder);
        let n1 = nb.MakeEq("x", "t");
        let n2 = nb.MakeEq("y", "t");
        let n = nb.ApplyBoolean(NDDBuilder.And, [n1, n2]);
        expect(nb.EvalPartialEnv(new Map<VariableName, ValueName>([["x", "f"], ["y", "f"]]), n)).toBe(0);
        expect(nb.EvalPartialEnv(new Map<VariableName, ValueName>([["x", "f"], ["y", "t"]]), n)).toBe(0);
        expect(nb.EvalPartialEnv(new Map<VariableName, ValueName>([["x", "t"], ["y", "f"]]), n)).toBe(0);
        expect(nb.EvalPartialEnv(new Map<VariableName, ValueName>([["x", "t"], ["y", "t"]]), n)).toBe(1);
    });

    it("should support Exists", () => {
        let varOrder: VariableName[] = ["x", "y"];
        let twoVars = new Map<VariableName, Set<ValueName>>([["x", new Set(["f", "t"])], ["y", new Set(["f", "t"])]]);
        let nb = new NamedBuilder(twoVars, varOrder);
        let n1 = nb.MakeEq("x", "t");
        let n2 = nb.MakeEq("y", "t");
        let n = nb.ApplyBoolean(NDDBuilder.And, [n1, n2]);
        expect(nb.Exists("x", n)).toBe(n2);
        expect(nb.Exists("y", n)).toBe(n1);
    });

    it("should support Composition", () => {
        // check that (x and y)[not x/y] = false
        let varOrder: VariableName[] = ["x", "y"];
        let twoVars = new Map<VariableName, Set<ValueName>>([["x", new Set(["f", "t"])], ["y", new Set(["f", "t"])]]);
        let nb = new NamedBuilder(twoVars, varOrder);
        let n1 = nb.MakeEq("x", "t");
        let n2 = nb.MakeEq("y", "t");
        let n = nb.ApplyBoolean(NDDBuilder.And, [n1, n2]);
        let notX = nb.MakeEq("x", "f");
        expect(nb.Composition(n, notX, "y")).toBe(0);
    });
});
