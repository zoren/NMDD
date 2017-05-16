import NMDDBuilder from "./NMDDBuilder";

export default class NDDBuilder extends NMDDBuilder {
    constructor(domainSizes: number[]) {
        super(2, domainSizes);
    }
}
