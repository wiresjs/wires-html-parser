"use strict";
var State_1 = require("./State");
var TAG_OPENED = "1";
var TAG_CLOSING = "2";
var TAG_CLOSED = "3";
var TAG_CREATED = "4";
var TAG_OPENING = "5";
var TAG_TEXT_OPENING = "6";
var TAG_TEXT = "7";
var TAG_TEXT_END = "8";
var TAG_CONSUMED = "9";
var SUSPECTING_COMMENT = "10";
var COMMENT_PENDING = "11";
var COMMENT_CREATED = "12";
var COMMENT_CONSUMING = "13";
var COMMENT_CLOSING = "14";
var COMMENT_CLOSED = "15";
var COMMENT_RESUMED = "16";
var SUSPECTING_CLOSING_COMMENT = "14";
var TagAnalyzer = (function () {
    function TagAnalyzer() {
        this.state = new State_1.State();
        this.state.set(TAG_TEXT_OPENING);
    }
    TagAnalyzer.prototype.isCreated = function () {
        return this.state.has(TAG_CREATED);
    };
    TagAnalyzer.prototype.isOpened = function () {
        return this.state.has(TAG_OPENED);
    };
    TagAnalyzer.prototype.isClosed = function () {
        return this.state.has(TAG_CLOSED);
    };
    TagAnalyzer.prototype.isText = function () {
        return this.state.has(TAG_TEXT);
    };
    TagAnalyzer.prototype.isConsumed = function () {
        return this.state.has(TAG_CONSUMED);
    };
    TagAnalyzer.prototype.shouldResumeComment = function () {
        return this.state.once(COMMENT_RESUMED);
    };
    TagAnalyzer.prototype.isTextEnd = function () {
        return this.state.has(TAG_TEXT_END);
    };
    TagAnalyzer.prototype.isCommentConsuming = function () {
        return this.state.has(COMMENT_CONSUMING);
    };
    TagAnalyzer.prototype.closeTag = function () {
        this.state.unset(TAG_OPENING, TAG_OPENED, TAG_OPENED);
        this.state.set(TAG_CONSUMED);
    };
    TagAnalyzer.prototype.isCommentClosed = function () {
        return this.state.once(COMMENT_CLOSED);
    };
    TagAnalyzer.prototype.isCommentCreated = function () {
        return this.state.has(COMMENT_CREATED);
    };
    TagAnalyzer.prototype.analyze = function (i, last) {
        var state = this.state;
        if (state.has(TAG_TEXT_OPENING)) {
            state.set(TAG_TEXT);
        }
        state.clean(TAG_CLOSED, COMMENT_RESUMED, TAG_TEXT_END, TAG_TEXT_OPENING, TAG_CONSUMED);
        if (i === "/" && state.has(TAG_OPENING)) {
            state.set(TAG_CLOSING);
            state.unset(TAG_OPENING, TAG_OPENED);
        }
        if (state.once(COMMENT_CREATED)) {
            state.set(COMMENT_CONSUMING);
            return;
        }
        if (state.once(COMMENT_PENDING)) {
            if (i === "-") {
                state.removeAll();
                state.set(COMMENT_CREATED);
                state.set(COMMENT_CONSUMING);
                return;
            }
        }
        if (state.once(SUSPECTING_COMMENT)) {
            if (i === "-") {
                state.set(COMMENT_PENDING);
            }
        }
        if (state.has(COMMENT_CLOSING)) {
            if (i === ">") {
                state.removeAll();
                state.set(COMMENT_CLOSED);
                state.set(TAG_TEXT_OPENING);
                return;
            }
        }
        if (state.once(SUSPECTING_CLOSING_COMMENT)) {
            if (i === "-") {
                state.set(COMMENT_CLOSING);
            }
            else {
                state.set(COMMENT_RESUMED);
                state.set(COMMENT_CONSUMING);
                return;
            }
        }
        if (state.has(COMMENT_CONSUMING)) {
            if (i === "-") {
                state.set(SUSPECTING_CLOSING_COMMENT);
                state.memorizeChar(i);
                state.unset(COMMENT_CONSUMING);
                return;
            }
        }
        if (state.has(TAG_CREATED)) {
            state.unset(TAG_CREATED);
            state.set(TAG_OPENED);
        }
        if (state.has(TAG_OPENING)) {
            if (i === "!") {
                state.set(SUSPECTING_COMMENT);
            }
            else {
                state.set(TAG_CREATED);
            }
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
    };
    return TagAnalyzer;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TagAnalyzer;
