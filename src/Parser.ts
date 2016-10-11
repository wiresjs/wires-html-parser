import { Comment } from "./Comment";
import TagAnalyzer from "./TagAnalyzer";
import { Tag } from "./Tag";
import { Text } from "./Text";


const AUTO_CLOSED_TAGS = ["area", "base", "br", "col",
    "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];

export class Parser {

    /**
     * parse  parses html into an object with "root" and children
     *
     *    <div id="test">hello <s>my</s> world</div>'
     *
     * will give a structure
     *    Tag (test)
     *       children:
     *          Text "hello "
     *          Tag (s)
     *             children:
     *                Text "my"
     *          Text " world"
     * @param  {type} html description
     * @return {type}      description
     */
    public static parse(html: string, json?): (Tag | Text)[] {

        let analyzer = new TagAnalyzer();
        let root = new Tag();
        let comment: Comment;
        let text;

        for (let i = 0; i < html.length; i++) {
            let symbol = html[i];
            let last = i === html.length - 1;
            analyzer.analyze(symbol, last);
            if (analyzer.shouldResumeComment()) {
                if (comment) {
                    comment.add(analyzer.state.getMemorizedChar()); // resume a comment here
                }
            }
            if (analyzer.isCommentCreated()) {
                comment = new Comment();
            } else if (analyzer.isCommentConsuming()) {
                if (comment) {
                    comment.add(symbol);
                }
            } else if (analyzer.isCommentClosed()) {
                root.addTag(comment);
                comment = null;
            } else if (analyzer.isCreated()) {
                let tag = new Tag(root);
                tag.parse(symbol);
                root.addTag(tag);
                root = tag;
            } else if (analyzer.isOpened()) {
                root.parse(symbol);
            } else if (analyzer.isClosed()) {
                if (!root.consumed) {
                    root.consume(analyzer);
                }
                if (root.name) {
                    root = root.parent;
                }
            } else if (analyzer.isConsumed()) {
                root.consume(analyzer);
                root.consumed = true;
                if (AUTO_CLOSED_TAGS.indexOf(root.name) > -1) {
                    root.autoClosed = true;
                    root = root.parent;
                }
            } else if (analyzer.isText()) {
                text = text || "";
                text += symbol;
                if (last && root) {
                    root.addText(new Text(text));
                }
            } else if (analyzer.isTextEnd()) {
                if (root) {
                    root.addText(new Text(text));
                }
                text = undefined;
            }
        }
        return root ?
            json ? Parser.toJSON(root.children) : root.children : [];
    }

    public static html2json(data: any) {
        let json = this.parse(data);
        return this.toJSON(json);
    }

    public static toJSON(data: any) {
        let items = [];
        for (let i = 0; i < data.length; i++) {
            let item = data[i];

            let obj: any = {};
            let isTag = item instanceof Tag;
            let isComment = item instanceof Comment;

            obj.type = isComment ? "comment" : isTag ? "tag" : "text";
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
    }
}

