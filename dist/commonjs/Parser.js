"use strict";
var Comment_1 = require("./Comment");
var TagAnalyzer_1 = require("./TagAnalyzer");
var Tag_1 = require("./Tag");
var Text_1 = require("./Text");
var AUTO_CLOSED_TAGS = ["area", "base", "br", "col",
    "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
var Parser = (function () {
    function Parser() {
    }
    Parser.parse = function (html, json) {
        var analyzer = new TagAnalyzer_1.default();
        var root = new Tag_1.Tag();
        var comment;
        var text;
        for (var i = 0; i < html.length; i++) {
            var symbol = html[i];
            var last = i === html.length - 1;
            analyzer.analyze(symbol, last);
            if (analyzer.shouldResumeComment()) {
                if (comment) {
                    comment.add(analyzer.state.getMemorizedChar());
                }
            }
            if (analyzer.isCommentCreated()) {
                comment = new Comment_1.Comment();
            }
            else if (analyzer.isCommentConsuming()) {
                if (comment) {
                    comment.add(symbol);
                }
            }
            else if (analyzer.isCommentClosed()) {
                root.addTag(comment);
                comment = null;
            }
            else if (analyzer.isCreated()) {
                var tag = new Tag_1.Tag(root);
                tag.parse(symbol);
                root.addTag(tag);
                root = tag;
            }
            else if (analyzer.isOpened()) {
                root.parse(symbol);
            }
            else if (analyzer.isClosed()) {
                if (!root.consumed) {
                    root.consume(analyzer);
                }
                if (root.name) {
                    root = root.parent;
                }
            }
            else if (analyzer.isConsumed()) {
                root.consume(analyzer);
                root.consumed = true;
                if (AUTO_CLOSED_TAGS.indexOf(root.name) > -1) {
                    root.autoClosed = true;
                    root = root.parent;
                }
            }
            else if (analyzer.isText()) {
                text = text || "";
                text += symbol;
                if (last && root) {
                    root.addText(new Text_1.Text(text));
                }
            }
            else if (analyzer.isTextEnd()) {
                if (root) {
                    root.addText(new Text_1.Text(text));
                }
                text = undefined;
            }
        }
        return root ?
            json ? Parser.toJSON(root.children) : root.children : [];
    };
    Parser.html2json = function (data) {
        var json = this.parse(data);
        return this.toJSON(json);
    };
    Parser.toJSON = function (data) {
        var items = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var obj = {};
            var isTag = item instanceof Tag_1.Tag;
            var isComment = item instanceof Comment_1.Comment;
            obj.type = isComment ? "comment" : isTag ? "tag" : "text";
            var attrs = {};
            if (item.attrs) {
                for (var a = 0; a < item.attrs.length; a++) {
                    var at = item.attrs[a];
                    attrs[at[0]] = at[1];
                }
            }
            if (Object.keys(attrs).length) {
                obj.attrs = attrs;
            }
            if (item.str) {
                obj.value = item.str;
            }
            if (item.name) {
                obj.name = item.name;
            }
            if (item.value) {
                obj.value = item.value;
            }
            if (item.children && item.children.length) {
                obj.children = Parser.toJSON(item.children);
            }
            if (isTag || !isTag && obj.value) {
                items.push(obj);
            }
        }
        return items;
    };
    return Parser;
}());
exports.Parser = Parser;
