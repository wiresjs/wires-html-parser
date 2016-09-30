export declare class State {
    private states;
    set(...args: any[]): void;
    clean(...args: any[]): void;
    has(name: any): boolean;
    once(name: any): boolean;
    unset(...args: any[]): void;
}
