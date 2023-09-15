// src/parser/tokenizer.ts
var TokenType;
(function(TokenType2) {
  TokenType2["LESS_THAN"] = "LESS THAN";
  TokenType2["GREATER_THAN"] = "GREATER THAN";
  TokenType2["IDENT"] = "IDENTITY";
  TokenType2["EQUALS"] = "EQUALS";
  TokenType2["QUOTE"] = "QUOTE";
  TokenType2["DASH"] = "DASH";
  TokenType2["OPEN_BRACKET"] = "OPEN_BRACKET";
  TokenType2["CLOSE_BRACKET"] = "CLOSE_BRACKET";
  TokenType2["OPEN_PAREN"] = "OPEN_PAREN";
  TokenType2["CLOSE_PAREN"] = "CLOSE_PAREN";
  TokenType2["BACK_SLASH"] = "BACK_SLASH";
  TokenType2["OPEN_BRACE"] = "OPEN_BRACE";
  TokenType2["CLOSE_BRACE"] = "CLOSE_BRACE";
  TokenType2["DOUBLE_OPEN_BRACE"] = "DOUBLE_OPEN_BRACE";
  TokenType2["DOUBLE_CLOSE_BRACE"] = "DOUBLE_CLOSE_BRACE";
  TokenType2["SPACE"] = "SPACE";
  TokenType2["ATTRIBUTE"] = "ATTRIBUTE";
  TokenType2["START_SELECTOR"] = "START_SELECTOR";
  TokenType2["END_SELECTOR"] = "END_SELECTOR";
})(TokenType || (TokenType = {}));

class Tokenizer {
  characters;
  lineNumber = 0;
  tokens = [];
  inSelector = false;
  stringRegex = new RegExp(/[a-zA-Z]/i);
  constructor(characters) {
    this.characters = characters;
  }
  addToken = (type, value = null) => {
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
      });
    }
  };
  tokenize = () => {
    for (let i = 0;i < this.characters.length; i++) {
      if (this.characters[i] === "\n") {
        this.lineNumber++;
        continue;
      } else if (this.characters[i] === "<") {
        if (this.tokens.length > 0 && this.tokens[this.tokens.length - 1].type === TokenType.SPACE) {
          this.tokens.pop();
        }
        this.addToken(TokenType.LESS_THAN);
        this.inSelector = true;
        continue;
      } else if (this.characters[i] === ">") {
        this.addToken(TokenType.GREATER_THAN);
        this.inSelector = false;
        continue;
      } else if (this.characters[i] === "-") {
        this.addToken(TokenType.DASH);
        continue;
      } else if (this.characters[i] === "=") {
        this.addToken(TokenType.EQUALS);
        continue;
      } else if (this.characters[i] === "[") {
        this.addToken(TokenType.OPEN_BRACKET);
        continue;
      } else if (this.characters[i] === "]") {
        this.addToken(TokenType.CLOSE_BRACKET);
        continue;
      } else if (this.characters[i] === "(") {
        this.addToken(TokenType.OPEN_PAREN);
        continue;
      } else if (this.characters[i] === ")") {
        this.addToken(TokenType.CLOSE_PAREN);
        continue;
      } else if (this.characters[i] === "/") {
        this.addToken(TokenType.BACK_SLASH);
        continue;
      } else if (this.characters[i] === "{") {
        if (this.characters[i + 1] === "{") {
          this.addToken(TokenType.DOUBLE_OPEN_BRACE, "{{");
          let doubleBraceInnards = "";
          i += 2;
          while (this.characters[i] !== "}") {
            doubleBraceInnards += this.characters[i];
            if (i + 1 > this.characters.length) {
              break;
            }
            if (this.characters[i + 1] === "}" && this.characters[i + 2] === "}") {
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
      } else if (this.characters[i] === "}") {
        this.addToken(TokenType.CLOSE_BRACE);
        continue;
      } else if (this.characters[i] === '"') {
        this.addToken(TokenType.QUOTE);
        let quoteInnards = "";
        i++;
        while (this.characters[i] !== '"' && this.characters[i - 1] !== "\\") {
          quoteInnards += this.characters[i];
          if (i + 1 > this.characters.length) {
            break;
          }
          if (this.characters[i + 1] === '"' && this.characters[i] !== "\\") {
            break;
          }
          i++;
        }
        this.addToken(TokenType.IDENT, quoteInnards);
        this.addToken(TokenType.QUOTE);
        i++;
        continue;
      } else if (this.stringRegex.test(this.characters[i])) {
        let stringContent = "";
        while (this.stringRegex.test(this.characters[i])) {
          stringContent += this.characters[i];
          if (!this.stringRegex.test(this.characters[i + 1])) {
            break;
          }
          i++;
        }
        if (this.inSelector) {
          if (this.tokens[this.tokens.length - 1].type === TokenType.LESS_THAN) {
            this.addToken(TokenType.START_SELECTOR, stringContent);
          } else if (this.tokens[this.tokens.length - 1].type === TokenType.BACK_SLASH) {
            this.addToken(TokenType.END_SELECTOR, stringContent);
          } else {
            this.addToken(TokenType.ATTRIBUTE, stringContent);
          }
        } else {
          this.addToken(TokenType.IDENT, stringContent);
        }
        continue;
      } else if (this.characters[i] === " ") {
        if (!this.inSelector) {
          let spaces = "";
          while (this.characters[i] === " ") {
            spaces += " ";
            if (i + 1 > this.characters.length) {
              break;
            }
            if (this.characters[i + 1] !== " ") {
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
  };
}

// src/parser/parser.ts
class Parser {
  tokens;
  tokenIndex = 0;
  component;
  constructor(tokens, component) {
    this.tokens = tokens;
    this.component = component;
  }
  parseTokens = () => {
    const parseProgram = new ParseProgram(this);
    return parseProgram.parseProgram();
  };
  peek = (offset = 0) => {
    if (this.tokenIndex + offset > this.tokens.length) {
      return false;
    } else {
      return this.tokens[this.tokenIndex + offset];
    }
  };
  consume = () => {
    return this.tokens[this.tokenIndex++];
  };
  tryConsume = (type, errorMessage = "") => {
    const peeked = this.peek();
    if (peeked && peeked.type === type) {
      return this.consume();
    } else {
      if (errorMessage !== "") {
        throw new Error(`[PARSE ERROR][LINE ${peeked.lineNumber}]: ${errorMessage}`);
      } else {
        return null;
      }
    }
  };
}

class ParseProgram {
  parser;
  constructor(parser) {
    this.parser = parser;
  }
  parseProgram = () => {
    const elementData = [];
    const statementParser = new ParseElement(this.parser);
    while (this.parser.peek()) {
      const parsedElement = statementParser.parseElement();
      if (parsedElement) {
        elementData.push(parsedElement);
      }
    }
    return elementData;
  };
}

class ParseElement {
  parser;
  constructor(parser) {
    this.parser = parser;
  }
  parseElement = () => {
    let elementData = {
      attributes: [],
      children: [],
      componentArgs: [],
      selector: "",
      usedInComponent: this.parser.component,
      content: {
        key: "",
        value: ""
      },
      styleContent: ``,
      usesComponent: (...args) => {
      }
    };
    if (this.isOpenSelector()) {
      this.parser.tryConsume(TokenType.LESS_THAN);
      const selector = this.parser.consume();
      elementData.selector = selector.value;
      const attributeParser = new ParseAttributes(this.parser);
      while (this.parser.peek().type !== TokenType.GREATER_THAN) {
        elementData.attributes.push(attributeParser.parseAttribute());
      }
      this.parser.consume();
      while (this.parser.peek()) {
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
        while (this.parser.peek() && this.parser.peek().type !== TokenType.LESS_THAN) {
          elementData.content.value += this.parser.consume().value;
        }
        elementData.content.value = elementData.content.value.trim();
      }
      if (this.isEndSelector()) {
        this.parser.tryConsume(TokenType.LESS_THAN, `Missing Closing Selector for selector "${selector.value}" opened on line: ${selector.lineNumber}`);
        this.parser.tryConsume(TokenType.BACK_SLASH);
        this.parser.tryConsume(TokenType.END_SELECTOR);
        this.parser.tryConsume(TokenType.GREATER_THAN);
      }
    }
    return elementData;
  };
  isOpenSelector = () => {
    const peekLessThan = this.parser.peek();
    const peekStartSelector = this.parser.peek(1);
    return peekLessThan && peekLessThan.type === TokenType.LESS_THAN && peekStartSelector && peekStartSelector.type === TokenType.START_SELECTOR;
  };
  isSelectorContent = () => {
    const spacePeeked = this.parser.peek();
    const identityPeeked = this.parser.peek(1);
    return spacePeeked && spacePeeked.type === TokenType.SPACE && identityPeeked && identityPeeked.type === TokenType.IDENT;
  };
  isEndSelector = () => {
    const peekedLessThan = this.parser.peek();
    const peekedEndStatement = this.parser.peek(1);
    return peekedLessThan && peekedLessThan.type === TokenType.LESS_THAN && peekedEndStatement && peekedEndStatement.type === TokenType.BACK_SLASH;
  };
}

class ParseAttributes {
  parser;
  constructor(parser) {
    this.parser = parser;
  }
  parseAttribute = () => {
    const statement = {};
    if (this.parser.peek().type === TokenType.OPEN_BRACKET) {
      this.parser.consume();
      statement.key = `[${this.parser.consume().value}]`;
      this.parser.consume();
    } else if (this.parser.peek().type === TokenType.OPEN_PAREN) {
      this.parser.consume();
      statement.key = `(${this.parser.consume().value})`;
      this.parser.consume();
    } else {
      const attrKey = this.parser.tryConsume(TokenType.ATTRIBUTE);
      statement.key = attrKey?.value;
    }
    const equals = this.parser.tryConsume(TokenType.EQUALS);
    if (equals) {
      this.parser.tryConsume(TokenType.QUOTE, "Missing Quote After Attribute Definition");
      const attrValue = this.parser.consume();
      statement.value = attrValue?.value;
      this.parser.tryConsume(TokenType.QUOTE, "Missing Quote After Attribute Value Definition");
      if (statement.value.includes("{{")) {
        if (statement.value.includes("}}")) {
          statement.isExpression = true;
        } else {
          throw new Error(`[PARSE ERROR][LINE ${attrValue.lineNumber}]: Invalid Expression definition - ${attrValue.value}`);
        }
      }
    } else {
      statement.value = "true";
    }
    return statement;
  };
}

// src/parser/index.ts
var readModuleFile = (path) => {
  return Bun.file(import.meta.dir + path);
};
var parseHTML = async (htmlPath, cssPath, component) => {
  const html = readModuleFile(htmlPath);
  const htmlText = await html.text();
  const tokenizer3 = new Tokenizer(htmlText);
  tokenizer3.tokenize();
  const parser2 = new Parser(tokenizer3.tokens, component);
  const elementData = parser2.parseTokens();
  console.log(elementData);
};

class TestComponent {
}
parseHTML("/index.html", "/styles.css", TestComponent);
