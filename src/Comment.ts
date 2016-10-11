export class Comment {
    constructor(public value: string = "") { }
    public add(char: string) {
        this.value += char;
    }

}