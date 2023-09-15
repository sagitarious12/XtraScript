import { ExpressionString, Token, TokenType, isClass } from "../types/baseTypes";

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


export const parseExpressionConditional = (component: isClass, expression: ExpressionString): string => {
    let tokens: Token[] = [];
    let chars = expression.value.split("");
    for (let i = 0; i < chars.length; i++) {
        let temp = "";
        if (chars[i].match(/[a-z]/i)) {
            while(chars[i].match(/[a-z]/i) || chars[i].match(/[0-9]/i)) {
                temp += chars[i];
                if (i + 1 == chars.length || !(chars[i + 1].match(/[a-z]/i) || chars[i + 1].match(/[0-9]/i))) {
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

    let i = 0;
    const parseStatement = (tokens: Token[]) => {

        let runningValue: any = '';

        if (tokens[i].type === TokenType.ident && i + 1 < tokens.length && tokens[i + 1].type === TokenType.open_paren) {
            const currentToken = tokens[i];
            const parseArgs: any = [];
            i++; // function name
            i++; // open paren
            const parseArg = (): string | number | boolean | undefined => {
                if (tokens[i].type === TokenType.ident) {
                    const value = tokens[i].value;
                    if (tokens[i + 1].type === TokenType.comma) {
                        i++;
                    }
                    // TODO need to check if the arg is a function call
                    if ((value as string )[0]=== '"') {
                        return value;
                    } else if ((value as string)[0].match(/[0-9]/i)) {
                        return value;
                    } else {
                        return component[value as string];
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

            runningValue = component[currentToken.value as string](...parseArgs);
        } else {
            // consume variable name;
            if (tokens[i].value && (tokens[i].value as string)[0]=== '"') {
                runningValue = tokens[i].value;
            } else if ((tokens[i].value as string)[0].match(/[0-9]/i)) {
                runningValue = parseInt(tokens[i].value as string);
            } else {
                runningValue = component[tokens[i].value as string];
            }
            i++;
        }

        if (i < tokens.length) {
            if (tokens[i].type === TokenType.add) {
                i++;
                return runningValue + parseStatement(tokens);
            }
            else if (tokens[i].type === TokenType.sub) {
                i++;
                return runningValue - parseStatement(tokens);
            }
            else if (tokens[i].type === TokenType.mult) {
                i++;
                return runningValue * parseStatement(tokens);
            }
            else if (tokens[i].type === TokenType.div) {
                i++;
                return runningValue / parseStatement(tokens);
            }
        } else {
            return runningValue;
        }
    }
    
    const result = parseStatement(tokens);

    return result;
}