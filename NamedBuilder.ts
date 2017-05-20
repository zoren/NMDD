import NDDBuilder from "./NDDBuilder";

// wraps a NDDBuilder by giving names to variables and values
export default class NamedBuilder {
    private builder: NDDBuilder;

    private varNameToVarIndex: Map<ValueName, VarIndex> = new Map();
    private varIndexToVarName: Map<VarIndex, VariableName> = new Map();
    private valuesIndex: Map<VarIndex, {valueToIndex: Map<ValueName, ValueIndex>, indexToValue: Map<ValueIndex, ValueName>}> = new Map();

    constructor(private variables: Map<VariableName, Set<ValueName>>, private variableOrder: VariableName[]) {
        if (new Set(variableOrder).size !== variableOrder.length) {
            throw new Error("variable order has duplicates");
        }
        if (variables.size < variableOrder.length) {
            throw new Error("ordering contained undefined variables");
        }
        if (variables.size > variableOrder.length) {
            throw new Error("all vars where not covered by ordering");
        }
        let domainSizes: number[] = [];
        variables.forEach((values, varName) => {
            let index = variableOrder.indexOf(varName);
            if (index === -1) {
                throw new Error("variable not found in variable order");
            }
            this.varNameToVarIndex.set(varName, index);
            this.varIndexToVarName.set(index, varName);

            let valueToIndex = new Map<ValueName, ValueIndex>();
            let indexToValue = new Map<ValueIndex, ValueName>();
            Array.from(values).forEach((v, i) => { valueToIndex.set(v, i); indexToValue.set(i, v); });
            this.valuesIndex.set(index, {valueToIndex, indexToValue});
            domainSizes[index] = values.size;
        });
        this.builder = new NDDBuilder(domainSizes);
    }

    public MakeEq = (x: VariableName, value: ValueName) => {
        let index = this.GetVariableIndex(x);
        let valIndex = this.GetValueIndex(index, value);
        let values = this.builder.getDomainValues(index);
        return this.builder.Make(index, values.map(i => i === valIndex ? 1 : 0));
    }

    public MakeVariableEq = (x: VariableName, y: VariableName) => {
        let xindex = this.GetVariableIndex(x);
        let yindex = this.GetVariableIndex(y);
        let xValueIndex = this.valuesIndex.get(xindex);
        let yValueIndex = this.valuesIndex.get(yindex);
        if (xValueIndex === undefined || yValueIndex === undefined) {
            throw new Error();
        }
        let xv = xValueIndex.valueToIndex;
        let yv = yValueIndex.valueToIndex;
        let commonValues: string[] = [];
        xValueIndex.valueToIndex.forEach((v, k) => {
            if (yv.get(k) !== undefined) {
                commonValues.push(k);
            }
        });
        let dx = this.builder.getDomainValues(xindex);
        let dy = this.builder.getDomainValues(yindex);
        return commonValues.map(v => {
            let xvalIndex = xv.get(v);
            let yvalIndex = yv.get(v);
            let bx = this.builder.Make(xindex, dx.map(i => i === xvalIndex ? 1 : 0));
            let by = this.builder.Make(yindex, dx.map(i => i === yvalIndex ? 1 : 0));
            return this.builder.ApplyBoolean(NDDBuilder.And, [bx, by]);
        }).reduce((b1, b2) => this.builder.ApplyBoolean(NDDBuilder.Or, [b1, b2]));
    }

    public ApplyN = (op: (_: number[]) => number, givenNodes: number[]) => {
        return this.builder.ApplyN(op, givenNodes);
    }

    public ApplyBoolean = (op: (_: boolean[]) => boolean, givenNodes: NodeIndex[]) => {
        return this.builder.ApplyBoolean(op, givenNodes);
    }

    public Exists(x: VariableName, t: NodeIndex) {
        return this.builder.Exists(this.GetVariableIndex(x), t);
    }

    public Composition = (t: NodeIndex, tp: NodeIndex, x: VariableName) => {
        return this.builder.Composition(t, tp, this.GetVariableIndex(x));
    }

    public EvalPartialEnv = (env: Map<VariableName, ValueName>, root: number): number => {
        let penv = (varIndex: VarIndex) => {
            let value = env.get(this.GetVariableName(varIndex));
            if (value !== undefined) {
                let variableValueIndex = this.valuesIndex.get(varIndex);
                if (variableValueIndex !== undefined) {
                    return variableValueIndex.valueToIndex.get(value);
                }
            }
        };
        return this.builder.EvalPartialEnv(penv, root);
    }

    private GetVariableIndex(x: VariableName) {
        let index = this.varNameToVarIndex.get(x);
        if (index === undefined) {
            throw new Error(`variable ${x} not found`);
        }
        return index;
    }

    private GetValueIndex(x: VarIndex, valueName: ValueName) {
        let index = this.valuesIndex.get(x);
        if (index === undefined) {
            throw new Error(`variable ${x} not found`);
        }
        let valueIndex = index.valueToIndex.get(valueName);
        if (valueIndex === undefined) {
            throw new Error(`value ${valueName} not found`);
        }
        return valueIndex;
    }

    private GetVariableName(x: VarIndex) {
        let varName = this.varIndexToVarName.get(x);
        if (varName === undefined) {
            throw new Error(`variable ${x} not found`);
        }
        return varName;
    }
}
