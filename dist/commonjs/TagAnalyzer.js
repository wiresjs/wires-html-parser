"use strict";
const State_1 = require("./State");
const TAG_OPENED = "1";
const TAG_CLOSING = "2";
const TAG_CLOSED = "3";
const TAG_CREATED = "4";
const TAG_OPENING = "5";
const TAG_TEXT_OPENING = "6";
const TAG_TEXT = "7";
const TAG_TEXT_END = "8";
const TAG_CONSUMED = "9";
class TagAnalyzer {
    constructor() {
        this.state = new State_1.State();
    }
    isCreated() {
        return this.state.has(TAG_CREATED);
    }
    isOpened() {
        return this.state.has(TAG_OPENED);
    }
    isClosed() {
        return this.state.has(TAG_CLOSED);
    }
    isText() {
        return this.state.has(TAG_TEXT);
    }
    isConsumed() {
        return this.state.has(TAG_CONSUMED);
    }
    isTextEnd() {
        return this.state.has(TAG_TEXT_END);
    }
    closeTag() {
        this.state.unset(TAG_OPENING, TAG_OPENED, TAG_OPENED);
        this.state.set(TAG_CONSUMED);
    }
    analyze(i, last) {
        var state = this.state;
        if (state.has(TAG_TEXT_OPENING)) {
            state.set(TAG_TEXT);
        }
        state.clean(TAG_CLOSED, TAG_TEXT_END, TAG_TEXT_OPENING, TAG_CONSUMED);
        if (i === "/" && state.has(TAG_OPENING)) {
            state.set(TAG_CLOSING);
            state.unset(TAG_OPENING, TAG_OPENED);
        }
        if (state.has(TAG_CREATED)) {
            state.unset(TAG_CREATED);
            state.set(TAG_OPENED);
        }
        if (state.has(TAG_OPENING)) {
            state.set(TAG_CREATED);
            state.unset(TAG_OPENING);
        }
        if (i === "<") {
            if (!state.has(TAG_OPENED)) {
                state.set(TAG_OPENING);
            }
            if (state.has(TAG_TEXT)) {
                state.set(TAG_TEXT_END);
            }
            state.unset(TAG_TEXT, TAG_TEXT_OPENING);
        }
        if (i === ">") {
            state.set(TAG_TEXT_OPENING);
            if (state.once(TAG_CLOSING)) {
                state.unset(TAG_OPENED);
                return state.set(TAG_CLOSED);
            }
            else {
                state.set(TAG_CONSUMED);
            }
            if (state.has(TAG_OPENED)) {
                state.unset(TAG_OPENED);
            }
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TagAnalyzer;
