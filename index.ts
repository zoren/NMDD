import {default as nmdd} from "./NMDDBuilder";
import {default as ndd} from "./NDDBuilder";
import {default as bdd} from "./BDDBuilder";
import {default as named} from "./NamedBuilder";

namespace NMDD {
    export const NMDDBuilder = nmdd;
    export const NDDBuilder = ndd;
    export const BDDBuilder = bdd;
    export const NamedBuilder = named;
}

export = NMDD;
