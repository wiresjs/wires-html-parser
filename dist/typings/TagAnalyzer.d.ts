import { State } from "./State";
export default class TagAnalyzer {
    state: State;
    constructor();
    isCreated(): boolean;
    isOpened(): boolean;
    isClosed(): boolean;
    isText(): boolean;
    isConsumed(): boolean;
    shouldResumeComment(): boolean;
    isTextEnd(): boolean;
    isCommentConsuming(): boolean;
    closeTag(): void;
    isCommentClosed(): boolean;
    isCommentCreated(): boolean;
    analyze(i: any, last: any): void;
}
