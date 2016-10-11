"use strict";
class State {
    constructor() {
        this.states = new Set();
    }
    memorizeChar(char) {
        this.memorizedChar = char;
    }
    getMemorizedChar() {
        return this.memorizedChar;
    }
    resetMemorized() {
        delete this.memorizedChar;
    }
    set(...args) {
        for (let i = 0; i < arguments.length; i++) {
            let name = arguments[i];
            if (!this.states.has(name)) {
                this.states.add(name);
            }
        }
    }
    clean(...args) {
        for (let i = 0; i < arguments.length; i++) {
            let name = arguments[i];
            this.states.delete(name);
        }
    }
    has(name) {
        return this.states.has(name);
    }
    once(name) {
        let valid = this.states.has(name);
        if (valid) {
            this.states.delete(name);
        }
        return valid;
    }
    unset(...args) {
        for (let i = 0; i < arguments.length; i++) {
            let name = arguments[i];
            this.states.delete(name);
        }
    }
    removeAll() {
        this.states = new Set();
    }
}
exports.State = State;
