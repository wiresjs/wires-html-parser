"use strict";
class Comment {
    constructor(value = "") {
        this.value = value;
    }
    add(char) {
        this.value += char;
    }
}
exports.Comment = Comment;
