import * as math from 'mathjs'
    ;
export class Func {
    expression: math.MathNode
    compiled: math.EvalFunction


    constructor(expression: string) {
        this.expression = math.parse(expression);
        this.compiled = math.compile(expression)
    }

    add(f: Func): Func {
        return new Func(math.simplify("(" + this.expression + ") + (" + f.expression + ")").toString())
    }

    sub(f: Func): Func {
        return new Func(math.simplify("(" + this.expression + ") - (" + f.expression + ")").toString())
    }

    multiply(f: Func): Func {
        return new Func(math.simplify("(" + this.expression + ") * (" + f.expression + ")").toString())
    }

    divide(f: Func): Func {
        return new Func(math.simplify("(" + this.expression + ") / (" + f.expression + ")").toString())
    }

    derivative(symbol: string): Func {
        return new Func(math.derivative(this.expression, symbol).toString())
    }

    evaluate(scope: object): number {
        return this.compiled.evaluate(scope)
        // return this.expression.evaluate(scope)
    }
}
