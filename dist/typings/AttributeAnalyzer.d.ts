import { State } from "./State";
export default class AttributeAnalyzer {
    state: State;
    quote: string;
    constructor();
    consumeName(): boolean;
    closeName(): boolean;
    startAttrName(): boolean;
    consumeAttrName(): boolean;
    closeAttrName(): boolean;
    consumeAttrValue(): boolean;
    closeAttrValue(): boolean;
    analyze(i: any): this;
}
