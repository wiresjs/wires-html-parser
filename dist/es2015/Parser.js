import TagAnalyzer from "./TagAnalyzer";
import Tag from "./Tag";
import Text from "./Text";
const AUTO_CLOSED_TAGS = ["area", "base", "br", "col",
    "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
export class Parser {
    static parse(html, json) {
        let analyzer = new TagAnalyzer();
        let root = new Tag();
        let text;
        for (let i = 0; i < html.length; i++) {
            let symbol = html[i];
            let last = i === html.length - 1;
            analyzer.analyze(symbol, last);
            if (analyzer.isCreated()) {
                let tag = new Tag(root);
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
                    root.addText(new Text(text));
                }
            }
            else if (analyzer.isTextEnd()) {
                if (root) {
                    root.addText(new Text(text));
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
            let isTag = item instanceof Tag;
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
