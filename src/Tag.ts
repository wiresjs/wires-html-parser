import AttributeAnalyzer from "./AttributeAnalyzer";

export class Tag {
    public parent: any;
    public name: string = "";
    public children: any[] = [];
    public attrs: any[] = [];
    public raw: string = "";
    public consumed: boolean;
    public autoClosed: boolean;

    constructor(parent?) {
        this.parent = parent;
    }
    public addAttribute() {
        this.attrs.push(["", ""]);
    }
    public add2AttributeName(s) {
        let latest = this.attrs.length - 1;
        this.attrs[latest][0] += s;
    }
    public add2AttributeValue(s) {
        let latest = this.attrs.length - 1;
        this.attrs[latest][1] += s;
    }

    /**
     * addTag - adds a "Tag" instance to children
     *
     * @param  {type} tag description
     * @return {type}     description
     */
    public addTag(tag) {
        this.children.push(tag);
    }

    public consume(tagAnalyzer) {
        let analyzer = new AttributeAnalyzer();
        for (let i = 0; i < this.raw.length; i++) {
            let symbol = this.raw[i];
            let state = analyzer.analyze(symbol);
            if (state.consumeName()) {
                this.name += symbol;
            }
            // attribute names
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


    /**
     * addText - adds "text" instance to children
     *
     * @param  {type} text description
     * @return {type}      description
     */
    public addText(text) {
        this.children.push(text);
    }

    /**
     * parse - accepts characters
     *
     * @param  {type} s description
     * @return {type}   description
     */
    public parse(s) {
        this.raw += s;
    }
}