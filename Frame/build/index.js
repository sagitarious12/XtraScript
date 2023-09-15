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

// src/types/baseTypes.ts
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

// src/core/expression.ts
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
  let tokens = [];
  let chars = expression.value.split("");
  for (let i2 = 0;i2 < chars.length; i2++) {
    let temp = "";
    if (chars[i2].match(/[a-z]/i)) {
      while (chars[i2].match(/[a-z]/i) || chars[i2].match(/[0-9]/i)) {
        temp += chars[i2];
        if (i2 + 1 == chars.length || !(chars[i2 + 1].match(/[a-z]/i) || chars[i2 + 1].match(/[0-9]/i))) {
          break;
        }
        i2++;
      }
      tokens.push({ type: TokenType.ident, value: temp });
      continue;
    } else if (chars[i2] === '"') {
      temp += '"';
      i2++;
      while (chars[i2]) {
        temp += chars[i2];
        if (chars[i2 + 1] === '"') {
          temp += '"';
          break;
        } else if (i2 + 1 == chars.length) {
          break;
        }
        i2++;
      }
      tokens.push({ type: TokenType.ident, value: temp });
      continue;
    } else if (chars[i2].match(/[0-9]/i)) {
      while (chars[i2].match(/[0-9]/i)) {
        temp += chars[i2];
        if (i2 + 1 == chars.length || !chars[i2 + 1].match(/[0-9]/i)) {
          break;
        }
        i2++;
      }
      tokens.push({ type: TokenType.ident, value: temp });
      continue;
    } else if (chars[i2] === "+") {
      tokens.push({ type: TokenType.add });
      continue;
    } else if (chars[i2] === "-") {
      tokens.push({ type: TokenType.sub });
      continue;
    } else if (chars[i2] === "*") {
      tokens.push({ type: TokenType.mult });
      continue;
    } else if (chars[i2] === "/") {
      tokens.push({ type: TokenType.div });
      continue;
    } else if (chars[i2] === "(") {
      tokens.push({ type: TokenType.open_paren });
      continue;
    } else if (chars[i2] === ")") {
      tokens.push({ type: TokenType.close_paren });
      continue;
    } else if (chars[i2] === ",") {
      tokens.push({ type: TokenType.comma });
      continue;
    } else {
      continue;
    }
  }
  let i = 0;
  const parseStatement = (tokens2) => {
    let runningValue = "";
    if (tokens2[i].type === TokenType.ident && i + 1 < tokens2.length && tokens2[i + 1].type === TokenType.open_paren) {
      const currentToken = tokens2[i];
      const parseArgs = [];
      i++;
      i++;
      const parseArg = () => {
        if (tokens2[i].type === TokenType.ident) {
          const value = tokens2[i].value;
          if (tokens2[i + 1].type === TokenType.comma) {
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
        let result2 = parseArg();
        if (!result2) {
          continueGoing = false;
          continue;
        }
        i++;
        parseArgs.push(result2);
      }
      i++;
      runningValue = component[currentToken.value](...parseArgs);
    } else {
      if (tokens2[i].value && tokens2[i].value[0] === '"') {
        runningValue = tokens2[i].value;
      } else if (tokens2[i].value[0].match(/[0-9]/i)) {
        runningValue = parseInt(tokens2[i].value);
      } else {
        runningValue = component[tokens2[i].value];
      }
      i++;
    }
    if (i < tokens2.length) {
      if (tokens2[i].type === TokenType.add) {
        i++;
        return runningValue + parseStatement(tokens2);
      } else if (tokens2[i].type === TokenType.sub) {
        i++;
        return runningValue - parseStatement(tokens2);
      } else if (tokens2[i].type === TokenType.mult) {
        i++;
        return runningValue * parseStatement(tokens2);
      } else if (tokens2[i].type === TokenType.div) {
        i++;
        return runningValue / parseStatement(tokens2);
      }
    } else {
      return runningValue;
    }
  };
  const result = parseStatement(tokens);
  return result;
};

// src/core/componentValue.ts
var isNumeric = (str) => {
  if (typeof str != "string")
    return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};
var getComponentValue = (component, statement) => {
  let attributeValue = "";
  if (statement.isFunction) {
    let value = component[statement.value]();
    if (isNumeric(value)) {
      attributeValue = parseFloat(value);
    } else {
      attributeValue = value;
    }
  } else if (statement.isVariable) {
    let value = component[statement.value];
    if (isNumeric(value)) {
      attributeValue = parseFloat(value);
    } else {
      attributeValue = component[statement.value];
    }
  } else if (statement.isConditional) {
    const expressions = getExpressions(statement.value);
    expressions.forEach((expr) => {
      if (expr.isExpression) {
        let value = parseExpressionConditional(component, expr);
        if (isNumeric(value)) {
          attributeValue += parseFloat(value);
        } else {
          attributeValue += value;
        }
      } else {
        attributeValue += expr.value;
      }
    });
  } else if (statement.isExpression) {
    const expressions = getExpressions(statement.value);
    expressions.forEach((expr) => {
      if (expr.isExpression) {
        let value = parseExpressionConditional(component, expr);
        if (isNumeric(value)) {
          attributeValue += parseFloat(value);
        } else {
          attributeValue += value;
        }
      } else {
        attributeValue += expr.value;
      }
    });
  } else {
    attributeValue = statement.value;
  }
  return attributeValue;
};

// src/core/onChanges.ts
var createOnChanges = (component, el, data, parentComponent = null, continueIterating = true) => {
  let originalOnChanges = component.onChanges;
  component.onChanges = (changes) => {
    if (Object.keys(changes).length > 0) {
      data.attributes.forEach((statement) => {
        if (statement.key.includes("$"))
          return;
        if (statement.key.includes("[") && statement.key.includes("]")) {
          if (parentComponent) {
            const value = statement.key.replace("[", "").replace("]", "");
            const protoKeys = Object.keys(Object.getPrototypeOf(parentComponent));
            const mainKeys = Object.keys(parentComponent);
            const allKeys = [...protoKeys, ...mainKeys];
            if (allKeys.includes(value)) {
              parentComponent[value] = getComponentValue(component, statement);
            }
          }
        } else if (statement.key.includes("(") && statement.key.includes(")")) {
          if (parentComponent) {
            const value = statement.key.replace("(", "").replace(")", "");
            const protoKeys = Object.keys(Object.getPrototypeOf(parentComponent));
            const mainKeys = Object.keys(parentComponent);
            const allKeys = [...protoKeys, ...mainKeys];
            if (allKeys.includes(value)) {
              parentComponent[value] = component[statement.value];
            }
          }
        } else {
          el.setAttribute(statement.key, getComponentValue(component, statement));
        }
      });
      if (data.content && data.content.value !== "") {
        if (data.content.isExpression) {
          el.textContent = getComponentValue(component, data.content);
        } else {
          el.textContent = data.content.value;
        }
      }
    }
    if (originalOnChanges) {
      originalOnChanges(changes);
    }
  };
  if (parentComponent && continueIterating) {
    createOnChanges(parentComponent, el, data, component, false);
  }
};

// src/core/createElement.ts
var createElement = (data, component, shadow = null, parentComponent = null) => {
  const el = document.createElement(data.selector);
  let shadowRoot;
  if (shadow === null) {
    shadowRoot = el.attachShadow({ mode: "open" });
  } else {
    shadowRoot = shadow;
  }
  if (data.styleContent) {
    const style = document.createElement("style");
    style.textContent = data.styleContent;
    shadowRoot.appendChild(style);
  }
  data.attributes.forEach((statement) => {
    if (statement.key.includes("[") && statement.key.includes("]")) {
      if (parentComponent) {
        const value = statement.key.replace("[", "").replace("]", "");
        component[value] = getComponentValue(parentComponent, statement);
      }
    } else if (statement.key.includes("(") && statement.key.includes(")")) {
      if (parentComponent) {
        const value = statement.key.replace("(", "").replace(")", "");
        component[value] = parentComponent[statement.value];
      }
    } else if (statement.key.includes("$")) {
      el.addEventListener(statement.key.replace("$", ""), component[statement.value]);
    } else {
      el.setAttribute(statement.key, getComponentValue(component, statement));
    }
  });
  if (data.content && data.content.value !== "") {
    if (data.content.isExpression) {
      el.textContent = getComponentValue(component, data.content);
    } else {
      el.textContent = data.content.value;
    }
  }
  const isChildComponentSame = (child) => {
    if (child.usesComponent || data.usesComponent) {
      if (shadow) {
        return child.usesComponent?.name === data.usedInComponent.name;
      } else {
        return child.usedInComponent.name === data.usesComponent?.name;
      }
    }
    return child.usedInComponent.name === data.usedInComponent.name;
  };
  data.children.forEach((child) => {
    let childComponent;
    if (!isChildComponentSame(child) && child.usesComponent) {
      childComponent = new child.usesComponent(...data.componentArgs);
    } else {
      childComponent = {};
    }
    if (shadow !== null) {
      el.appendChild(createElement(child, isChildComponentSame(child) ? component : childComponent, isChildComponentSame(child) ? shadowRoot : null, !isChildComponentSame(child) ? component : null));
    } else {
      shadowRoot.appendChild(createElement(child, isChildComponentSame(child) ? component : childComponent, isChildComponentSame(child) ? shadowRoot : null, !isChildComponentSame(child) ? component : null));
    }
  });
  createOnChanges(component, el, data, parentComponent);
  return el;
};

// src/core/createWebPage.ts
var createWebPage = (data) => {
  data.forEach((element) => {
    let component = new element.usedInComponent(...element.componentArgs);
    document.body.appendChild(createElement(element, component, null));
  });
};

// src/decorators/emit.ts
function Emit() {
  return function(target, propertyKey) {
    let fn;
    const emit = (...args) => {
      fn(...args);
    };
    const getter = () => {
      return {
        emit
      };
    };
    const setter = (emitFn) => {
      fn = emitFn;
    };
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter
    });
  };
}

// src/decorators/frame.ts
function Frame() {
  function frame(constructor) {
    function frameConstructor(...args) {
      let constructedValue = new constructor(...args);
      let previous = JSON.parse(JSON.stringify(constructedValue));
      let originalOnDestroy = constructedValue.onDestroy;
      let originalOnChanges = constructedValue.onChanges;
      constructedValue.onChanges = (changes) => {
        if (originalOnChanges) {
          originalOnChanges(changes);
        }
      };
      let interval = setInterval(() => {
        let changes = {};
        let current = JSON.parse(JSON.stringify(constructedValue));
        Object.keys(current).forEach((key) => {
          if (current[key] !== previous[key]) {
            changes[key] = {
              previous: previous[key],
              current: current[key]
            };
          }
        });
        previous = current;
        if (Object.keys(changes).length > 0) {
          constructedValue.onChanges(changes);
        }
      }, 100);
      constructedValue.onDestroy = () => {
        if (originalOnDestroy) {
          originalOnDestroy();
        }
        clearInterval(interval);
      };
      return constructedValue;
    }
    Object.defineProperty(frameConstructor, "name", { value: constructor.name, writable: false });
    return frameConstructor;
  }
  return frame;
}

// src/decorators/prop.ts
function Prop() {
  return function(target, propertyKey) {
    let key = Symbol();
    const getter = function() {
      return this[key];
    };
    const setter = function(newVal) {
      let previous = this[key];
      if (newVal && isNumeric(newVal)) {
        this[key] = parseFloat(newVal);
      } else {
        this[key] = newVal;
      }
      if (this.onChanges) {
        this.onChanges({
          [propertyKey]: {
            previous,
            current: this[key]
          }
        });
      }
    };
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true
    });
  };
}

// src/index.ts
class Component {
  displayValue = 1;
  addedNumber = 4;
  constructor() {
  }
  getDisplayValue = () => {
    return this.displayValue;
  };
  updateDisplayValue = (value) => {
    this.displayValue = value;
  };
  getSomeText = () => {
    return "From A Whole New World";
  };
}
Component = __decorateClass([
  Frame()
], Component);

class SubComponent {
  somethingElse = "Hello World";
  updateDisplayValue = () => {
    this.emitter.emit(this.parentValue + 1);
  };
}
__decorateClass([
  Prop()
], SubComponent.prototype, "parentValue", 2);
__decorateClass([
  Emit()
], SubComponent.prototype, "emitter", 2);
SubComponent = __decorateClass([
  Frame()
], SubComponent);
var data = [
  {
    attributes: [
      {
        key: "data-value",
        value: "displayValue",
        isVariable: true
      }
    ],
    children: [
      {
        attributes: [
          {
            key: "class",
            value: "awesome-class"
          }
        ],
        children: [
          {
            attributes: [
              {
                key: "class",
                value: "sub-awesome-class"
              }
            ],
            children: [],
            usedInComponent: Component,
            componentArgs: [],
            selector: "div",
            content: {
              value: "Hello {{getDisplayValue() + addedNumber}} {{getSomeText()}}",
              key: "",
              isExpression: true
            }
          },
          {
            attributes: [
              {
                key: "[parentValue]",
                value: "{{displayValue}}",
                isExpression: true
              },
              {
                key: "(emitter)",
                value: "updateDisplayValue"
              }
            ],
            children: [
              {
                attributes: [
                  {
                    key: "class",
                    value: "sub-component-class"
                  }
                ],
                children: [],
                usedInComponent: SubComponent,
                componentArgs: [],
                selector: "div",
                content: {
                  value: "Parent Component Value: {{parentValue}}",
                  key: "",
                  isExpression: true
                }
              },
              {
                attributes: [
                  {
                    key: "class",
                    value: "sub-component-button"
                  },
                  {
                    key: "$click",
                    value: "updateDisplayValue"
                  }
                ],
                children: [],
                usedInComponent: SubComponent,
                componentArgs: [],
                selector: "button",
                content: {
                  value: "Click Me!",
                  key: "",
                  isExpression: true
                }
              }
            ],
            usedInComponent: Component,
            usesComponent: SubComponent,
            componentArgs: [],
            selector: "my-sub-component",
            content: {
              value: "",
              key: ""
            },
            styleContent: `
.sub-component-class {
    width: 100%;
    min-height: 150px;
    background: green;
    font-size: 32px;
    color: dark-green;
}
                        `
          }
        ],
        usedInComponent: Component,
        componentArgs: [],
        selector: "div",
        content: {
          value: "",
          key: ""
        }
      }
    ],
    usedInComponent: Component,
    usesComponent: Component,
    content: {
      value: "",
      key: ""
    },
    selector: "my-component",
    componentArgs: [],
    styleContent: `
.awesome-class {
    height: 200px;
    font-size: 25px;
    display: flex;
    flex-direction: column;
}

.sub-awesome-class {
    color: blue;
    letter-spacing: 3px;
    width: 100%;
    display: flex;
    flex-direction: column;
}
        `
  }
];
createWebPage(data);
