"use strict";
var Comment = (function () {
    function Comment(value) {
        if (value === void 0) { value = ""; }
        this.value = value;
    }
    Comment.prototype.add = function (char) {
        this.value += char;
    };
    return Comment;
}());
exports.Comment = Comment;
