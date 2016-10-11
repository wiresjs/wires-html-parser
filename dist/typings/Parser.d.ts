import { Tag } from "./Tag";
import { Text } from "./Text";
export declare class Parser {
    static parse(html: string, json?: any): (Tag | Text)[];
    static html2json(data: any): any[];
    static toJSON(data: any): any[];
}
