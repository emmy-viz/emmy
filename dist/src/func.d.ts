import * as math from 'mathjs';
export declare class Func {
    expression: math.MathNode;
    constructor(expression: string);
    add(f: Func): Func;
    sub(f: Func): Func;
    multiply(f: Func): Func;
    divide(f: Func): Func;
    derivative(symbol: string): Func;
    evaluate(scope: object): number;
}
