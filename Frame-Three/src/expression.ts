import { BuiltinInterfaces, ExpressionString, Token, TokenType } from "./types";

export const getExpressions = (value: string): ExpressionString[] => {
    const split = value.split("{{");
    const expressions: ExpressionString[] = [
        {
            value: split[0]
        }
    ];
    for(let i = 1; i < split.length; i++) {
        const splitAgain = split[i].split("}}");
        expressions.push(
            {
                value: splitAgain[0],
                isExpression: true
            },
            {
                value: splitAgain[1]
            }
        );
    }
    return expressions
}


export const parseExpressionConditional = (component: BuiltinInterfaces<void>, expression: ExpressionString | ExpressionString[]): string => {
    if (Array.isArray(expression)) {
        let result = '';
        for (let i = 0; i < expression.length; i++) {
            if (expression[i].isExpression) {
                const tokens = getTokens(expression[i].value.split(''));
                const parseResult = parseStatement(component, tokens);
                result += parseResult + ' ';
            }
        }
        return result;
    } else {
        const tokens = getTokens(expression.value.split(''));
        const result = parseStatement(component, tokens);
        return result;
    }
    
}

const getTokens = (chars: string[]): Token[] => {
    
    let tokens: Token[] = [];
    for (let i = 0; i < chars.length; i++) {
        let temp = "";
        if (chars[i].match(/[a-z]/i)) {
            while(chars[i].match(/[a-z]/i) || chars[i].match(/[0-9]/i) || chars[i] === '_') {
                temp += chars[i];
                if (i + 1 == chars.length || !(chars[i + 1].match(/[a-z]/i) || chars[i + 1].match(/[0-9]/i) || chars[i + 1] === '_')) {
                    break;
                }
                i++;
            }
            tokens.push({type: TokenType.ident, value: temp});
            continue;
        } else if (chars[i] === '"') {
            temp += '"';
            i++;
            while(chars[i]) {
                temp += chars[i];
                if (chars[i + 1] === '"') {
                    temp += '"';
                    break;
                } else if (i + 1 == chars.length) {
                    break;
                }
                i++;
            }
            tokens.push({type: TokenType.ident, value: temp});
            continue;
        } else if (chars[i].match(/[0-9]/i)) {
            while(chars[i].match(/[0-9]/i)) {
                temp += chars[i];
                if (i + 1 == chars.length || !(chars[i + 1].match(/[0-9]/i))) {
                    break;
                }
                i++;
            }
            tokens.push({type: TokenType.ident, value: temp});
            continue;
        } else if (chars[i] === '+') {
            tokens.push({type: TokenType.add});
            continue;
        } else if (chars[i] === '-') {
            tokens.push({type: TokenType.sub});
            continue;
        } else if (chars[i] === '*') {
            tokens.push({type: TokenType.mult});
            continue;
        } else if (chars[i] === '/') {
            tokens.push({type: TokenType.div});
            continue;
        } else if (chars[i] === '(') {
            tokens.push({type: TokenType.open_paren});
            continue;
        } else if (chars[i] === ')') {
            tokens.push({type: TokenType.close_paren});
            continue;} else if (chars[i] === ',') {
            tokens.push({type: TokenType.comma});
            continue;
        } else {
            continue;
        }
    };
    return tokens;
}

const parseStatement = (component: BuiltinInterfaces<void>, tokens: Token[]): string => {
    let i = 0;
    const parse = (t: Token[]): string => {

        let runningValue: any = '';
        if (t[i].type === TokenType.ident && i + 1 < t.length && t[i + 1].type === TokenType.open_paren) {
            const currentToken = t[i];
            const parseArgs: any = [];
            i++; // function name
            i++; // open paren
            const parseArg = (): string | number | boolean | undefined => {
                if (t[i].type === TokenType.ident) {
                    const value = t[i].value;
                    if (t[i + 1].type === TokenType.comma) {
                        i++;
                    }
                    // TODO need to check if the arg is a function call
                    if ((value as string )[0]=== '"') {
                        return value;
                    } else if ((value as string)[0].match(/[0-9]/i)) {
                        return value;
                    } else {
                        return (component as any)[value as string];
                    }
                }
                return undefined;
            }
            let continueGoing: boolean = true;
            while(continueGoing) {
                let result = parseArg();
                if (!result) {
                    continueGoing = false;
                    continue;
                };
                // consume the function / variable name;
                i++;
                parseArgs.push(result);
            }

            // consume the close paren
            i++;

            runningValue = (component as any)[currentToken.value as string](...parseArgs);
        } else {
            // consume variable name;
            if (t[i].value && (t[i].value as string)[0]=== '"') {
                runningValue = t[i].value;
            } else if ((t[i].value as string)[0].match(/[0-9]/i)) {
                runningValue = parseInt(t[i].value as string);
            } else {
                try {
                    runningValue = (component as any)[t[i].value as string];
                } catch (e) {
                    console.log("RUNING VALUE", runningValue);
                    return runningValue;
                }
            }
            i++;
        }

        if (i < t.length) {
            if (t[i].type === TokenType.add) {
                i++;
                return (parseFloat(runningValue) + parseFloat(parse(t))).toString();
            }
            else if (t[i].type === TokenType.sub) {
                i++;
                return (parseFloat(runningValue) - parseFloat(parse(t))).toString();
            }
            else if (t[i].type === TokenType.mult) {
                i++;
                return (parseFloat(runningValue) * parseFloat(parse(t))).toString();
            }
            else if (t[i].type === TokenType.div) {
                i++;
                return (parseFloat(runningValue) / parseFloat(parse(t))).toString();
            }
        } 
        return runningValue;
    }
    return parse(tokens);
}