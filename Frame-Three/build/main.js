var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? undefined : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator;i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// src/types.ts
var TokenType;
(function(TokenType2) {
  TokenType2[TokenType2["ident"] = 0] = "ident";
  TokenType2[TokenType2["add"] = 1] = "add";
  TokenType2[TokenType2["sub"] = 2] = "sub";
  TokenType2[TokenType2["mult"] = 3] = "mult";
  TokenType2[TokenType2["div"] = 4] = "div";
  TokenType2[TokenType2["open_paren"] = 5] = "open_paren";
  TokenType2[TokenType2["close_paren"] = 6] = "close_paren";
  TokenType2[TokenType2["comma"] = 7] = "comma";
  TokenType2[TokenType2["function"] = 8] = "function";
})(TokenType || (TokenType = {}));

// src/expression.ts
var getExpressions = (value) => {
  const split = value.split("{{");
  const expressions = [
    {
      value: split[0]
    }
  ];
  for (let i = 1;i < split.length; i++) {
    const splitAgain = split[i].split("}}");
    expressions.push({
      value: splitAgain[0],
      isExpression: true
    }, {
      value: splitAgain[1]
    });
  }
  return expressions;
};
var parseExpressionConditional = (component, expression) => {
  if (Array.isArray(expression)) {
    let result = "";
    for (let i = 0;i < expression.length; i++) {
      if (expression[i].isExpression) {
        const tokens = getTokens(expression[i].value.split(""));
        const parseResult = parseStatement(component, tokens);
        result += parseResult + " ";
      }
    }
    return result;
  } else {
    const tokens = getTokens(expression.value.split(""));
    const result = parseStatement(component, tokens);
    return result;
  }
};
var getTokens = (chars) => {
  let tokens = [];
  for (let i = 0;i < chars.length; i++) {
    let temp = "";
    if (chars[i].match(/[a-z]/i)) {
      while (chars[i].match(/[a-z]/i) || chars[i].match(/[0-9]/i) || chars[i] === "_") {
        temp += chars[i];
        if (i + 1 == chars.length || !(chars[i + 1].match(/[a-z]/i) || chars[i + 1].match(/[0-9]/i) || chars[i + 1] === "_")) {
          break;
        }
        i++;
      }
      tokens.push({ type: TokenType.ident, value: temp });
      continue;
    } else if (chars[i] === '"') {
      temp += '"';
      i++;
      while (chars[i]) {
        temp += chars[i];
        if (chars[i + 1] === '"') {
          temp += '"';
          break;
        } else if (i + 1 == chars.length) {
          break;
        }
        i++;
      }
      tokens.push({ type: TokenType.ident, value: temp });
      continue;
    } else if (chars[i].match(/[0-9]/i)) {
      while (chars[i].match(/[0-9]/i)) {
        temp += chars[i];
        if (i + 1 == chars.length || !chars[i + 1].match(/[0-9]/i)) {
          break;
        }
        i++;
      }
      tokens.push({ type: TokenType.ident, value: temp });
      continue;
    } else if (chars[i] === "+") {
      tokens.push({ type: TokenType.add });
      continue;
    } else if (chars[i] === "-") {
      tokens.push({ type: TokenType.sub });
      continue;
    } else if (chars[i] === "*") {
      tokens.push({ type: TokenType.mult });
      continue;
    } else if (chars[i] === "/") {
      tokens.push({ type: TokenType.div });
      continue;
    } else if (chars[i] === "(") {
      tokens.push({ type: TokenType.open_paren });
      continue;
    } else if (chars[i] === ")") {
      tokens.push({ type: TokenType.close_paren });
      continue;
    } else if (chars[i] === ",") {
      tokens.push({ type: TokenType.comma });
      continue;
    } else {
      continue;
    }
  }
  return tokens;
};
var parseStatement = (component, tokens) => {
  let i = 0;
  const parse = (t) => {
    let runningValue = "";
    if (t[i].type === TokenType.ident && i + 1 < t.length && t[i + 1].type === TokenType.open_paren) {
      const currentToken = t[i];
      const parseArgs = [];
      i++;
      i++;
      const parseArg = () => {
        if (t[i].type === TokenType.ident) {
          const value = t[i].value;
          if (t[i + 1].type === TokenType.comma) {
            i++;
          }
          if (value[0] === '"') {
            return value;
          } else if (value[0].match(/[0-9]/i)) {
            return value;
          } else {
            return component[value];
          }
        }
        return;
      };
      let continueGoing = true;
      while (continueGoing) {
        let result = parseArg();
        if (!result) {
          continueGoing = false;
          continue;
        }
        i++;
        parseArgs.push(result);
      }
      i++;
      runningValue = component[currentToken.value](...parseArgs);
    } else {
      if (t[i].value && t[i].value[0] === '"') {
        runningValue = t[i].value;
      } else if (t[i].value[0].match(/[0-9]/i)) {
        runningValue = parseInt(t[i].value);
      } else {
        try {
          runningValue = component[t[i].value];
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
      } else if (t[i].type === TokenType.sub) {
        i++;
        return (parseFloat(runningValue) - parseFloat(parse(t))).toString();
      } else if (t[i].type === TokenType.mult) {
        i++;
        return (parseFloat(runningValue) * parseFloat(parse(t))).toString();
      } else if (t[i].type === TokenType.div) {
        i++;
        return (parseFloat(runningValue) / parseFloat(parse(t))).toString();
      }
    }
    return runningValue;
  };
  return parse(tokens);
};

// src/prop-decorator.ts
function Prop() {
  return function(target, propertyKey) {
    let key = Symbol();
    const getter = function() {
      return this[key];
    };
    const setter = function(newVal) {
      if (newVal && isNumeric(newVal)) {
        this[key] = parseFloat(newVal);
      } else {
        this[key] = newVal;
      }
    };
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true
    });
    const previousProps = target["inputProps"] ? target["inputProps"] : [];
    Object.defineProperty(target, "inputProps", {
      value: [...previousProps, "data-" + propertyKey],
      writable: true
    });
  };
}
var isNumeric = (str) => {
  if (typeof str != "string")
    return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};

// src/utils.ts
var getHtml = (path, resolve) => {
  let xhr = new XMLHttpRequest;
  xhr.onreadystatechange = function() {
    if (this.readyState !== 4)
      return;
    if (this.status !== 200) {
      console.error("COULD NOT FIND HTML FILE WITH PATH", path);
      throw "Failed to retrieve html file";
    }
    const template = document.createElement("template");
    template.innerHTML = xhr.response;
    resolve(template);
  };
  xhr.open("GET", path, true);
  xhr.send();
};
var getStyles = (path, html, resolve) => {
  let xhr = new XMLHttpRequest;
  xhr.onreadystatechange = function() {
    if (this.readyState !== 4)
      return;
    if (this.status !== 200) {
      console.error("COULD NOT FIND CSS FILE WITH PATH", path);
      throw "Failed to retrieve css file";
    }
    resolve({ css: xhr.response, html });
  };
  xhr.open("GET", path, true);
  xhr.send();
};

// src/main.ts
function Frame(args) {
  function ctor(constructor) {
    getHtml(args.markup, (html) => {
      getStyles(args.styles, html, (results) => {
        defineElement(args.marker, results.html, results.css, constructor);
      });
    });
    return constructor;
  }
  return ctor;
}
var isInputPropAttribute = (name) => name[0] === "[" && name[name.length - 1] === "]";
var stripBracketsFromAttribute = (name) => name.replace("[", "").replace("]", "");
var isHTMLExpression = (value) => value.includes("}}") && value.includes("}}");
var htmlTags = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "math", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "search", "section", "select", "slot", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"];
var ChangableNodeTypes;
(function(ChangableNodeTypes2) {
  ChangableNodeTypes2[ChangableNodeTypes2["CUSTOM"] = 0] = "CUSTOM";
  ChangableNodeTypes2[ChangableNodeTypes2["TEXT"] = 1] = "TEXT";
})(ChangableNodeTypes || (ChangableNodeTypes = {}));
var defineElement = (selector, html, styles, component) => {

  class EL extends HTMLElement {
    component;
    changableNodes = [];
    static attrs = [...component.prototype["inputProps"] ? component.prototype["inputProps"] : []];
    static get observedAttributes() {
      return this.attrs;
    }
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.appendChild(document.createTextNode(styles));
      this.shadowRoot?.appendChild(style);
      this.shadowRoot?.appendChild(html.content.cloneNode(true));
      this.component = new component;
      this.setupComponentProxies();
      this.setChangableNodes();
      this.checkTheseAttributes(this.attributes);
    }
    setupComponentProxies = () => {
      const _this = this;
      const name = this.component.constructor.name;
      this.component = new Proxy(this.component, {
        get(target, p, receiver) {
          const value = target[p];
          if (value instanceof Function) {
            return function(...args) {
              return value.apply(this === receiver ? target : this, args);
            };
          }
          return value;
        },
        set(target, p, newValue) {
          target[p] = newValue;
          _this.performChangeDetection(_this);
          return true;
        }
      });
    };
    checkTheseAttributes = (attributes, performChangeDetection = true) => {
      for (let i = 0;i < attributes.length; i++) {
        let attr = attributes.item(i);
        if (isInputPropAttribute(attr.name)) {
          let strippedName = stripBracketsFromAttribute(attr.name);
          let prev = this.component[strippedName];
          if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
            const result = parseExpressionConditional(this.parent, getExpressions(attr.nodeValue));
            this.component[strippedName] = result;
          } else {
            this.component[strippedName] = attr.nodeValue;
          }
          if (this.component.onChanges) {
            this.component.onChanges({
              [strippedName]: {
                current: attr.nodeValue,
                previous: prev
              }
            });
          }
          if (performChangeDetection) {
            this.performChangeDetection(this);
          }
          this.removeAttribute(attr.name);
        }
      }
    };
    connectedCallback() {
      if (this.component.onInit) {
        this.component.onInit();
      }
    }
    disconnectedCallback() {
      if (this.component.onDestroy) {
        this.component.onDestroy();
      }
    }
    attributeChangedCallback(attrName, oldVal, newValue) {
      if (attrName.includes("data-") && newValue !== null) {
        let attr = attrName.replace("data-", "");
        this.component[attr] = newValue;
        if (this.component.onChanges) {
          this.component.onChanges({
            [attr]: {
              current: newValue,
              previous: oldVal
            }
          });
        }
      }
      this.performChangeDetection(this);
      this.removeAttribute(attrName);
    }
    setChangableNodes = () => {
      const checkNode = (node) => {
        if (node.nodeName === "STYLE")
          return;
        if (node.childNodes.length > 0) {
          node.childNodes.forEach((child) => {
            checkNode(child);
          });
        }
        if (node.nodeName === "#text") {
          if (node.nodeValue.slice(1, node.nodeValue.length).trim() === "")
            return;
          if (node.nodeValue?.includes("{{") && node.nodeValue.includes("}}")) {
            node["permanentValue"] = node.nodeValue;
            this.changableNodes.push({ type: ChangableNodeTypes.TEXT, node });
            return;
          }
        }
        if (node.localName && !htmlTags.includes(node.localName)) {
          let attrs = [];
          for (let i = 0;i < node.attributes.length; i++) {
            attrs.push(node.attributes.item(i));
          }
          node["permanentAttributes"] = attrs;
          node["parent"] = this.component;
          this.changableNodes.push({ type: ChangableNodeTypes.CUSTOM, node });
          return;
        }
      };
      this.shadowRoot?.childNodes.forEach((node) => {
        checkNode(node);
      });
    };
    performChangeDetection = (_this) => {
      _this.changableNodes.forEach((node) => {
        if (node.type === ChangableNodeTypes.TEXT) {
          const expressions = getExpressions(node.node["permanentValue"]);
          const expressionResult = parseExpressionConditional(_this.component, expressions);
          node.node.nodeValue = expressionResult;
          return;
        }
        if (node.type === ChangableNodeTypes.CUSTOM) {
          for (let i = 0;i < node.node["permanentAttributes"].length; i++) {
            let attr = node.node["permanentAttributes"][i];
            let strippedName = stripBracketsFromAttribute(attr.name);
            if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
              const exprResult = parseExpressionConditional(_this.component, getExpressions(attr.nodeValue));
              console.log(exprResult);
              node.node.setAttribute(`data-${strippedName}`, exprResult);
            }
          }
          return;
        }
      });
    };
  }
  customElements.define(selector, EL);
};

class Component {
  value = 1;
  secondaryContent = "Here is the slot Content From Frame Component";
  constructor() {
    this.text = "Hello World";
    setTimeout(() => {
      this.secondaryContent = "Here is some updated value";
    }, 2000);
  }
}
__decorateClass([
  Prop()
], Component.prototype, "text", 2);
Component = __decorateClass([
  Frame({
    marker: "frame-component",
    markup: "./frame/frame.html",
    styles: "./frame/frame.css"
  })
], Component);

class ChildComponent {
  constructor() {
    this.some_text = "Hello Child Component";
  }
  onChanges(changes) {
  }
}
__decorateClass([
  Prop()
], ChildComponent.prototype, "some_text", 2);
ChildComponent = __decorateClass([
  Frame({
    marker: "frame-child-component",
    markup: "./frame-child/child.html",
    styles: "./frame-child/child.css"
  })
], ChildComponent);
export {
  Frame
};
