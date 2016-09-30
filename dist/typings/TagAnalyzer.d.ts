import { State } from "./State";
export default class TagAnalyzer {
    state: State;
    constructor();
    isCreated(): boolean;
    isOpened(): boolean;
    isClosed(): boolean;
    isText(): boolean;
    isConsumed(): boolean;
    isTextEnd(): boolean;
    closeTag(): void;
    analyze(i: any, last: any): void;
}
