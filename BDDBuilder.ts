import NDDBuilder from "./NDDBuilder";

export default class BDDBuilder extends NDDBuilder {
    constructor(numberOfBinaryVars: number) {
        let domainSizes = [];
        for (let i = 0; i < numberOfBinaryVars; i++) {
            domainSizes.push(2);
        }
        super(domainSizes);
    }
}
