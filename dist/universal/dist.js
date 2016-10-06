(function($__exports__, $isBackend) {var __local__ = {};var define = function(n, d, f) {__local__[n] = { d: d, f: f }};var __resolve__ = function(name) {var m = __local__[name];if (m === undefined) {if ($isBackend) {return require(name);} else {$__exports__.__npm__ = $__exports__.__npm__ || {};return $__exports__.__npm__[name];}}if (m.r) { return m.r; }m.r = {};var z = [__resolve__, m.r];for (var i = 2; i < m.d.length; i++) {z.push(__resolve__(m.d[i]));}m.f.apply(null, z);return m.r;};
define("State", ["require", "exports"], function (require, exports) {
    "use strict";
    class State {
        constructor() {
            this.states = new Set();
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
    }
    exports.State = State;
});
define("AttributeAnalyzer", ["require", "exports", "State"], function (require, exports, State_1) {
    "use strict";
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
});
define("TagAnalyzer", ["require", "exports", "State"], function (require, exports, State_2) {
    "use strict";
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
            this.state = new State_2.State();
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
});
define("Tag", ["require", "exports", "AttributeAnalyzer"], function (require, exports, AttributeAnalyzer_1) {
    "use strict";
    class Tag {
        constructor(parent) {
            this.name = "";
            this.children = [];
            this.attrs = [];
            this.raw = "";
            this.parent = parent;
        }
        addAttribute() {
            this.attrs.push(["", ""]);
        }
        add2AttributeName(s) {
            let latest = this.attrs.length - 1;
            this.attrs[latest][0] += s;
        }
        add2AttributeValue(s) {
            let latest = this.attrs.length - 1;
            this.attrs[latest][1] += s;
        }
        addTag(tag) {
            this.children.push(tag);
        }
        consume(tagAnalyzer) {
            let analyzer = new AttributeAnalyzer_1.default();
            for (let i = 0; i < this.raw.length; i++) {
                let symbol = this.raw[i];
                let state = analyzer.analyze(symbol);
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
        }
        addText(text) {
            this.children.push(text);
        }
        parse(s) {
            this.raw += s;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Tag;
});
define("Text", ["require", "exports"], function (require, exports) {
    "use strict";
    class Text {
        constructor(str) {
            this.str = str;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Text;
});
define("Parser", ["require", "exports", "TagAnalyzer", "Tag", "Text"], function (require, exports, TagAnalyzer_1, Tag_1, Text_1) {
    "use strict";
    const AUTO_CLOSED_TAGS = ["area", "base", "br", "col",
        "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
    class Parser {
        static parse(html, json) {
            let analyzer = new TagAnalyzer_1.default();
            let root = new Tag_1.default();
            let text;
            for (let i = 0; i < html.length; i++) {
                let symbol = html[i];
                let last = i === html.length - 1;
                analyzer.analyze(symbol, last);
                if (analyzer.isCreated()) {
                    let tag = new Tag_1.default(root);
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
                        root.addText(new Text_1.default(text));
                    }
                }
                else if (analyzer.isTextEnd()) {
                    if (root) {
                        root.addText(new Text_1.default(text));
                    }
                    text = undefined;
                }
            }
            return root ? json ? Parser.toJSON(root.children) : root.children : [];
        }
        static html2json(data) {
            let json = this.parse(data);
            return this.toJSON(json);
        }
        static toJSON(data) {
            let items = [];
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                let obj = {};
                let isTag = item instanceof Tag_1.default;
                obj.type = isTag ? "tag" : "text";
                let attrs = {};
                if (item.attrs) {
                    for (let a = 0; a < item.attrs.length; a++) {
                        let at = item.attrs[a];
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
                if (item.children && item.children.length) {
                    obj.children = Parser.toJSON(item.children);
                }
                if (isTag || !isTag && obj.value) {
                    items.push(obj);
                }
            }
            return items;
        }
    }
    exports.Parser = Parser;
});
define("index", ["require", "exports", "Parser"], function (require, exports, Parser_1) {
    "use strict";
    exports.HTMLParser = Parser_1.Parser;
});

var __expose__ = function(n, m, w, c) {
    var cs = c ? c.split(",") : [];
    if (cs.length) { for (var ln in __local__) { for (var i = 0; i < cs.length; i++) { if (ln.indexOf(cs[i]) === 0) { __resolve__(ln) } } } }
    var e = __resolve__(n);
    var bc;
    if (!$isBackend) { var npm = $__exports__.__npm__ = $__exports__.__npm__ || {}; if (m) { bc = npm[m] = {} } }
    for (var k in e) {
        $isBackend || w ? $__exports__[k] = e[k] : null;
        bc ? bc[k] = e[k] : null;
    }

};
__expose__("index", "wires-html-parser", true, "");
})(typeof module !== "undefined" && module.exports && typeof process === "object" ?
    exports : typeof window !== "undefined" ? window : this,
    typeof module !== "undefined" && module.exports && typeof process === "object");