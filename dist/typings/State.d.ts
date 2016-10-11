export declare class State {
    private states;
    private memorizedChar;
    memorizeChar(char: string): void;
    getMemorizedChar(): any;
    resetMemorized(): void;
    set(...args: any[]): void;
    clean(...args: any[]): void;
    has(name: any): boolean;
    once(name: any): boolean;
    unset(...args: any[]): void;
    removeAll(): void;
}
