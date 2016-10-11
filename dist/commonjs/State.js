"use strict";
var State = (function () {
    function State() {
        this.states = new Set();
    }
    State.prototype.memorizeChar = function (char) {
        this.memorizedChar = char;
    };
    State.prototype.getMemorizedChar = function () {
        return this.memorizedChar;
    };
    State.prototype.resetMemorized = function () {
        delete this.memorizedChar;
    };
    State.prototype.set = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < arguments.length; i++) {
            var name_1 = arguments[i];
            if (!this.states.has(name_1)) {
                this.states.add(name_1);
            }
        }
    };
    State.prototype.clean = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < arguments.length; i++) {
            var name_2 = arguments[i];
            this.states.delete(name_2);
        }
    };
    State.prototype.has = function (name) {
        return this.states.has(name);
    };
    State.prototype.once = function (name) {
        var valid = this.states.has(name);
        if (valid) {
            this.states.delete(name);
        }
        return valid;
    };
    State.prototype.unset = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < arguments.length; i++) {
            var name_3 = arguments[i];
            this.states.delete(name_3);
        }
    };
    State.prototype.removeAll = function () {
        this.states = new Set();
    };
    return State;
}());
exports.State = State;
