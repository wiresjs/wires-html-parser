import AttributeAnalyzer from "./AttributeAnalyzer";
export default class Tag {
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
        let analyzer = new AttributeAnalyzer();
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
