"use strict";
var AttributeAnalyzer_1 = require("./AttributeAnalyzer");
var Tag = (function () {
    function Tag(parent) {
        this.name = "";
        this.children = [];
        this.attrs = [];
        this.raw = "";
        this.parent = parent;
    }
    Tag.prototype.addAttribute = function () {
        this.attrs.push(["", ""]);
    };
    Tag.prototype.add2AttributeName = function (s) {
        var latest = this.attrs.length - 1;
        this.attrs[latest][0] += s;
    };
    Tag.prototype.add2AttributeValue = function (s) {
        var latest = this.attrs.length - 1;
        this.attrs[latest][1] += s;
    };
    Tag.prototype.addTag = function (tag) {
        this.children.push(tag);
    };
    Tag.prototype.consume = function (tagAnalyzer) {
        var analyzer = new AttributeAnalyzer_1.default();
        for (var i = 0; i < this.raw.length; i++) {
            var symbol = this.raw[i];
            var state = analyzer.analyze(symbol);
            if (state.consumeName()) {
                this.name += symbol;
            }
            if (state.startAttrName()) {
                this.addAttribute();
            }
            if (state.consumeAttrName()) {
                this.add2AttributeName(symbol);
            }
            if (state.consumeAttrValue()) {
                this.add2AttributeValue(symbol);
            }
        }
    };
    Tag.prototype.addText = function (text) {
        this.children.push(text);
    };
    Tag.prototype.parse = function (s) {
        this.raw += s;
    };
    return Tag;
}());
exports.Tag = Tag;
