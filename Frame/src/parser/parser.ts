import { ElementData, Statement } from '../types/baseTypes';
import { Token, TokenType } from './tokenizer';

export class Parser {
    tokens: Token[];
    tokenIndex: number = 0;
    component: ((...args: any[]) => void);
    
    constructor(tokens: Token[], component: ((...args: any[]) => void)) {
        this.tokens = tokens;
        this.component = component;
    }

    parseTokens = (): ElementData[] => {
        const parseProgram = new ParseProgram(this);        
        return parseProgram.parseProgram();
    }

    peek = (offset: number = 0): Token | boolean => {
        if (this.tokenIndex + offset > this.tokens.length) {
            return false;
        } else {
            return this.tokens[this.tokenIndex + offset];
        }
    }

    consume = (): Token => {
        return this.tokens[this.tokenIndex++];
    }

    tryConsume = (type: TokenType, errorMessage: string = ''): Token | null => {
        const peeked = this.peek();
        if (peeked && (peeked as Token).type === type) {
            return this.consume();
        } else {
            if (errorMessage !== '') {
                throw new Error(`[PARSE ERROR][LINE ${(peeked as Token).lineNumber}]: ${errorMessage}`);
            } else {
                return null;
            }
        }
    }
}

class ParseProgram {
    parser: Parser;

    constructor(parser: Parser) {
        this.parser = parser;
    }

    parseProgram = (): ElementData[] => {
        const elementData: ElementData[] = [];

        const statementParser: ParseElement = new ParseElement(this.parser);

        while(this.parser.peek()) {
            const parsedElement = statementParser.parseElement();
            if (parsedElement) {
                elementData.push(parsedElement);
            }
        }

        return elementData;
    }
}

class ParseElement {
    parser: Parser;

    constructor(parser: Parser) {
        this.parser = parser;
    }

    parseElement = (): ElementData | null => {
        let elementData: ElementData = {
            attributes: [],
            children: [],
            componentArgs: [],
            selector: '',
            usedInComponent: this.parser.component,
            content: {
                key: '',
                value:''
            },
            styleContent: ``,
            usesComponent: (...args: any[]) => {}
        };

        if (this.isOpenSelector()) {
            this.parser.tryConsume(TokenType.LESS_THAN);
            const selector = this.parser.consume();
            elementData.selector = selector.value as string;

            // TODO need to figure out how to get the usesComponent for selectors that
            // are not standard HTML elements


            const attributeParser: ParseAttributes = new ParseAttributes(this.parser);
            while((this.parser.peek() as Token).type !== TokenType.GREATER_THAN) {
                elementData.attributes.push(attributeParser.parseAttribute());
            }

            this.parser.consume(); // greater than

            while(this.parser.peek()) {
                if (this.isOpenSelector()) {
                    const child = this.parseElement();
                    if (child) {
                        elementData.children.push(child);
                    }
                } else {
                    break;
                }
            }

            if (this.isSelectorContent()) {
                while(this.parser.peek() && (this.parser.peek() as Token).type !== TokenType.LESS_THAN) {
                    (elementData.content as Statement).value += this.parser.consume().value;
                }
                (elementData.content as Statement).value = (elementData.content as Statement).value.trim();
            }

            if (this.isEndSelector()) {
                this.parser.tryConsume(TokenType.LESS_THAN, `Missing Closing Selector for selector "${selector.value}" opened on line: ${selector.lineNumber}`);
                this.parser.tryConsume(TokenType.BACK_SLASH);
                this.parser.tryConsume(TokenType.END_SELECTOR);
                this.parser.tryConsume(TokenType.GREATER_THAN);
            }
        }

        return elementData;
    }

    private isOpenSelector = (): boolean => {
        const peekLessThan = this.parser.peek();
        const peekStartSelector = this.parser.peek(1);
        return peekLessThan &&
            (peekLessThan as Token).type === TokenType.LESS_THAN &&
            peekStartSelector &&
            (peekStartSelector as Token).type === TokenType.START_SELECTOR;
    }

    private isSelectorContent = (): boolean => {
        const spacePeeked = this.parser.peek();
        const identityPeeked = this.parser.peek(1);
        return spacePeeked &&
            (spacePeeked as Token).type === TokenType.SPACE &&
            identityPeeked &&
            (identityPeeked as Token).type === TokenType.IDENT;
    }

    private isEndSelector = (): boolean => {
        const peekedLessThan = this.parser.peek();
        const peekedEndStatement = this.parser.peek(1);
        return peekedLessThan &&
            (peekedLessThan as Token).type === TokenType.LESS_THAN &&
            peekedEndStatement &&
            (peekedEndStatement as Token).type === TokenType.BACK_SLASH;
    }
}

class ParseAttributes {
    parser: Parser;

    constructor(parser: Parser) {
        this.parser = parser;
    }

    parseAttribute = (): Statement => {
        const statement: Statement = {} as Statement;

        if ((this.parser.peek() as Token).type === TokenType.OPEN_BRACKET) {
            this.parser.consume();
            statement.key = `[${(this.parser.consume() as Token).value}]`;
            this.parser.consume();
        } else if ((this.parser.peek() as Token).type === TokenType.OPEN_PAREN) {
            this.parser.consume();
            statement.key = `(${(this.parser.consume() as Token).value})`;
            this.parser.consume();
        } else {
            const attrKey = this.parser.tryConsume(TokenType.ATTRIBUTE) as Token;
            statement.key = (attrKey?.value as string);
        }

        const equals = this.parser.tryConsume(TokenType.EQUALS);
        if (equals) {
            this.parser.tryConsume(TokenType.QUOTE, "Missing Quote After Attribute Definition");
            const attrValue = this.parser.consume();
            statement.value = (attrValue?.value as string);
            this.parser.tryConsume(TokenType.QUOTE, "Missing Quote After Attribute Value Definition");
            if (statement.value.includes("{{")) {
                if (statement.value.includes('}}')) {
                    statement.isExpression = true;
                } else {
                    throw new Error(`[PARSE ERROR][LINE ${attrValue.lineNumber}]: Invalid Expression definition - ${attrValue.value}`);
                }
            }
        } else {
            statement.value = 'true';
        }

        return statement;
    }


}