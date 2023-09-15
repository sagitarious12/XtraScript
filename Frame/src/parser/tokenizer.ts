
export enum TokenType {
    LESS_THAN = 'LESS THAN',
    GREATER_THAN = 'GREATER THAN',
    IDENT = "IDENTITY",
    EQUALS = "EQUALS",
    QUOTE = "QUOTE",
    DASH = "DASH",
    OPEN_BRACKET = "OPEN_BRACKET",
    CLOSE_BRACKET = "CLOSE_BRACKET",
    OPEN_PAREN = "OPEN_PAREN",
    CLOSE_PAREN = "CLOSE_PAREN",
    BACK_SLASH = "BACK_SLASH",
    OPEN_BRACE = "OPEN_BRACE",
    CLOSE_BRACE = "CLOSE_BRACE",
    DOUBLE_OPEN_BRACE = "DOUBLE_OPEN_BRACE",
    DOUBLE_CLOSE_BRACE = "DOUBLE_CLOSE_BRACE",
    SPACE = "SPACE",
    ATTRIBUTE = "ATTRIBUTE",
    START_SELECTOR = "START_SELECTOR",
    END_SELECTOR = "END_SELECTOR"
}

export interface Token {
    lineNumber: number;
    type: TokenType;
    value?: string;
}

export class Tokenizer {
    characters: string;
    lineNumber: number = 0;
    tokens: Token[] = [];
    inSelector: boolean = false;

    private stringRegex = new RegExp(/[a-zA-Z]/i);

    constructor(characters: string) {
        this.characters = characters;
    }

    addToken = (type: TokenType, value: string | null = null) => {
        if (value) {
            this.tokens.push({
                type,
                value,
                lineNumber: this.lineNumber
            });
        } else {
            this.tokens.push({
                type,
                lineNumber: this.lineNumber
            })
        }
    }

    tokenize = () => {
        for(let i = 0; i < this.characters.length; i++) {
            if (this.characters[i] === '\n') {
                this.lineNumber++;
                continue;
            } else if (this.characters[i] === '<') {
                if (this.tokens.length > 0 && this.tokens[this.tokens.length - 1].type === TokenType.SPACE) {
                    this.tokens.pop();
                }
                this.addToken(TokenType.LESS_THAN);
                this.inSelector = true;
                continue;
            } else if (this.characters[i] === '>') {
                this.addToken(TokenType.GREATER_THAN);
                this.inSelector = false;
                continue;
            } else if (this.characters[i] === '-') {
                this.addToken(TokenType.DASH);
                continue;
            } else if (this.characters[i] === '=') {
                this.addToken(TokenType.EQUALS);
                continue;
            } else if (this.characters[i] === '[') {
                this.addToken(TokenType.OPEN_BRACKET);
                continue;
            } else if (this.characters[i] === ']') {
                this.addToken(TokenType.CLOSE_BRACKET);
                continue;
            } else if (this.characters[i] === '(') {
                this.addToken(TokenType.OPEN_PAREN);
                continue;
            } else if (this.characters[i] === ')') {
                this.addToken(TokenType.CLOSE_PAREN);
                continue;
            } else if (this.characters[i] === '/') {
                this.addToken(TokenType.BACK_SLASH);
                continue;
            } else if (this.characters[i] === '{') {
                if (this.characters[i + 1] === '{') {
                    this.addToken(TokenType.DOUBLE_OPEN_BRACE, "{{");
                    let doubleBraceInnards = '';
                    i += 2;
                    while(this.characters[i] !== '}') {
                        doubleBraceInnards += this.characters[i];
                        if (i + 1 > this.characters.length) {
                            break;
                        }
                        if (this.characters[i + 1] === '}' && this.characters[i + 2] === '}') {
                            break;
                        }
                        i++;
                    }
                    this.addToken(TokenType.IDENT, doubleBraceInnards);
                    this.addToken(TokenType.DOUBLE_CLOSE_BRACE, "}}");
                    i += 2;
                    continue;
                } 
                this.addToken(TokenType.OPEN_BRACE);
                continue;
            } else if (this.characters[i] === '}') {
                this.addToken(TokenType.CLOSE_BRACE);
                continue;
            } else if (this.characters[i] === '"') {
                this.addToken(TokenType.QUOTE);
                let quoteInnards = '';
                i++
                while(this.characters[i] !== '"' && this.characters[i - 1] !== '\\') {
                    quoteInnards += this.characters[i];
                    if (i + 1 > this.characters.length) {
                        break;
                    }
                    if (this.characters[i + 1] === '"' && this.characters[i] !== '\\') {
                        break;
                    } 
                    i++;
                }
                this.addToken(TokenType.IDENT, quoteInnards);
                this.addToken(TokenType.QUOTE);
                i++;
                continue;
            } else if (this.stringRegex.test(this.characters[i])) {
                let stringContent = '';
                while(this.stringRegex.test(this.characters[i])) {
                    stringContent += this.characters[i];
                    if (!this.stringRegex.test(this.characters[i + 1])) {
                        break;
                    }
                    i++;
                }
                if (this.inSelector) {
                    if (this.tokens[this.tokens.length - 1].type === TokenType.LESS_THAN) {
                        this.addToken(TokenType.START_SELECTOR, stringContent)
                    } else if (this.tokens[this.tokens.length - 1].type === TokenType.BACK_SLASH) {
                        this.addToken(TokenType.END_SELECTOR, stringContent);
                    } else {
                        this.addToken(TokenType.ATTRIBUTE, stringContent);
                    }
                } else {
                    this.addToken(TokenType.IDENT, stringContent);
                }
                continue;
            } else if (this.characters[i] === ' ') {
                if(!this.inSelector) {
                    let spaces = '';
                    while(this.characters[i] === ' ') {
                        spaces += ' ';
                        if (i + 1 > this.characters.length) {
                            break;
                        }
                        if (this.characters[i + 1] !== ' ') {
                            break;
                        }
                        i++;
                    }
                    this.addToken(TokenType.SPACE, spaces);
                }
                continue;
            } else {
                throw new Error(`[HTML PARSE ERROR]: failed to parse character ${this.characters[i]}`);
            }
        }
    }
}