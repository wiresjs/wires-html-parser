export default class Tag {
    parent: any;
    name: string;
    children: any[];
    attrs: any[];
    raw: string;
    consumed: boolean;
    autoClosed: boolean;
    constructor(parent?: any);
    addAttribute(): void;
    add2AttributeName(s: any): void;
    add2AttributeValue(s: any): void;
    addTag(tag: any): void;
    consume(tagAnalyzer: any): void;
    addText(text: any): void;
    parse(s: any): void;
}
