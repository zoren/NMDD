import NDDBuilder from "./NDDBuilder";

export default class Checker {
    public readonly builder: NDDBuilder;
    constructor(domainSizes: number[]) {
        this.builder = new NDDBuilder(domainSizes);
    }

    public ReachableStates(I: NodeIndex, T: NodeIndex, x: VarIndex[], xp: VarIndex[]) {
        let R = 0;
        let Rp: number;
        do {
            Rp = R;
            let tr = this.builder.ApplyBoolean(NDDBuilder.And, [T, R]);
            let Etr = x.reduce((acc, xv) => this.builder.Exists(xv, acc), tr);
            let IEtr = this.builder.ApplyBoolean(NDDBuilder.Or, [I, Etr]);
            R = x.reduce((acc, xv, i) => this.builder.Composition(acc, this.builder.Make(xv, [0, 1]), xp[i]), IEtr);
        } while (Rp !== R);
        return R;
    }
}
