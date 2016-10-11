"use strict";
const State_1 = require("./State");
let s = 0;
const NAME_PENDING = (s++).toString();
const NAME_CONSUMING = (s++).toString();
const NAME_CLOSED = (s++).toString();
const ATTR_NAME_PENDING = (s++).toString();
const ATTR_NAME_STARTED = (s++).toString();
const ATTR_NAME_CONSUMING = (s++).toString();
const ATTR_NAME_CLOSED = (s++).toString();
const ATTR_VALUE_PENDING = (s++).toString();
const ATTR_VALUE_MIGHT_START = (s++).toString();
const ATTR_VALUE_STARTING = (s++).toString();
const ATTR_VALUE_CONSUMING = (s++).toString();
const ATTR_VALUE_PAUSED = (s++).toString();
const ATTR_VALUE_CLOSED = (s++).toString();
class AttributeAnalyzer {
    constructor() {
        this.state = new State_1.State();
        this.state.set(NAME_PENDING);
    }
    consumeName() {
        return this.state.has(NAME_CONSUMING);
    }
    closeName() {
        return this.state.has(NAME_CLOSED);
    }
    startAttrName() {
        return this.state.has(ATTR_NAME_STARTED);
    }
    consumeAttrName() {
        return this.state.has(ATTR_NAME_CONSUMING);
    }
    closeAttrName() {
        return this.state.has(ATTR_NAME_CLOSED);
    }
    consumeAttrValue() {
        return this.state.has(ATTR_VALUE_CONSUMING);
    }
    closeAttrValue() {
        return this.state.has(ATTR_VALUE_CONSUMING);
    }
    analyze(i) {
        let state = this.state;
        state.clean(NAME_CLOSED, ATTR_NAME_STARTED, ATTR_NAME_CLOSED);
        if (i === undefined) {
            return this;
        }
        if (state.has(ATTR_VALUE_CONSUMING)) {
            if (i === "\\") {
                state.unset(ATTR_VALUE_CONSUMING);
                state.set(ATTR_VALUE_PAUSED);
            }
            if (i === this.quote) {
                state.unset(ATTR_VALUE_CONSUMING);
                state.set(ATTR_VALUE_CLOSED, ATTR_NAME_PENDING);
            }
        }
        if (state.has(ATTR_VALUE_PAUSED)) {
            if (i === this.quote) {
                state.unset(ATTR_VALUE_PAUSED);
                state.set(ATTR_VALUE_CONSUMING);
            }
        }
        if (state.has(ATTR_VALUE_STARTING)) {
            state.unset(ATTR_VALUE_STARTING);
            state.set(ATTR_VALUE_CONSUMING);
        }
        if (state.has(ATTR_VALUE_PENDING)) {
            if (!i.match(/[=\s"']/)) {
                state.unset(ATTR_VALUE_PENDING, ATTR_VALUE_MIGHT_START);
                state.set(ATTR_NAME_PENDING);
            }
            else {
                if (state.has(ATTR_VALUE_MIGHT_START)) {
                    if (i === "'" || i === '"') {
                        this.quote = i;
                        state.unset(ATTR_VALUE_PENDING, ATTR_VALUE_MIGHT_START);
                        state.set(ATTR_VALUE_STARTING);
                    }
                }
                if (i === "=") {
                    state.set(ATTR_VALUE_MIGHT_START);
                }
            }
        }
        if (state.has(ATTR_NAME_CONSUMING)) {
            if (!i.match(/[a-z0-9_-]/)) {
                state.unset(ATTR_NAME_CONSUMING);
                state.set(ATTR_NAME_CLOSED, ATTR_VALUE_PENDING);
                if (i === "=") {
                    state.set(ATTR_VALUE_MIGHT_START);
                }
            }
        }
        if (state.has(ATTR_NAME_PENDING)) {
            if (i.match(/[a-z0-9_-]/)) {
                state.unset(ATTR_NAME_PENDING);
                state.set(ATTR_NAME_STARTED, ATTR_NAME_CONSUMING);
            }
        }
        if (state.has(NAME_PENDING)) {
            if (i.match(/[a-z0-9_-]/)) {
                state.unset(NAME_PENDING);
                state.set(NAME_CONSUMING);
            }
        }
        if (state.has(NAME_CONSUMING)) {
            if (!i.match(/[a-z0-9_-]/)) {
                state.unset(NAME_CONSUMING);
                state.set(NAME_CLOSED);
                state.set(ATTR_NAME_PENDING);
            }
        }
        return this;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AttributeAnalyzer;
