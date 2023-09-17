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
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);

// src/types/tags.ts
var htmlTags = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "math",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "search",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
];

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
  const camelToDashCase = (str) => str.split(/\.?(?=[A-Z])/).join("-").toLowerCase();
  const el = document.createElement(htmlTags.includes(data.selector) ? data.selector : camelToDashCase(data.selector));
  let shadowRoot;
  if (shadow === null) {
    shadowRoot = el.attachShadow({ mode: "closed" });
  } else {
    shadowRoot = shadow;
  }
  console.log(data.styleContent);
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
      console.log(child.usesComponent.prototype);
      childComponent = window.dependencies.instantiate(child.usesComponent);
      console.log(child.usesComponent.prototype);
      child.usesComponent.prototype.constructor.markup.forEach((element) => {
        child.children.push(element);
      });
      child = Object.assign(child, { styleContent: child.usesComponent.prototype.constructor.styles });
    } else {
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
var createWebPage = (capsule) => {
  if (capsule.prototype.constructor.isCapsule) {
    const cap = capsule.prototype.constructor;
    const selector = cap.initComponent.prototype.constructor.marker;
    let component = window.dependencies.instantiate(cap.initComponent);
    let rootElement = {
      attributes: [],
      children: cap.initComponent.prototype.constructor.markup,
      selector,
      usedInComponent: cap.initComponent,
      content: { key: "", value: "" }
    };
    rootElement = Object.assign(rootElement, { styleContent: cap.initComponent.prototype.constructor.styles });
    document.body.appendChild(createElement(rootElement, component, null));
  } else {
    console.error("Must supply a Capsule to Create Web Page");
  }
};

// src/core/dependency-injector.ts
class DependencyInjector {
  services = [];
  addService = (service) => {
    const args = service.prototype.constructor.constructorArgs?.sort((a, b) => a.prop > b.prop ? 1 : -1).map((value) => value.value);
    let srv;
    if (args) {
      srv = new service(...args);
    } else {
      srv = new service;
    }
    this.services.push({
      name: service.prototype.constructor.name,
      service: srv
    });
    return srv;
  };
  instantiate = (service) => {
    return new service.prototype.constructor;
  };
  getService = (component) => {
    const found = this.services.find((value) => {
      return value.name === component;
    });
    if (found) {
      return found;
    }
    console.error("Invalid Dependency Injection, No Valid Service Found");
    return null;
  };
}

// src/decorators/capsule.ts
function Capsule(capsuleArgs) {
  function module(constructor) {
    function moduleConstructor(...args) {
      let constructed = new constructor(...args);
      return constructed;
    }
    if (capsuleArgs.Init) {
      Object.defineProperty(moduleConstructor, "initComponent", { value: capsuleArgs.Init, writable: false });
    }
    Object.defineProperty(moduleConstructor, "name", { value: constructor.name, writable: false });
    Object.defineProperty(moduleConstructor, "isCapsule", { value: true, writable: false });
    return moduleConstructor;
  }
  return module;
}

// src/decorators/frame.ts
function Frame(frameArgs) {
  function frame(constructor) {
    function frameConstructor() {
      const finalArgs = constructor.prototype.constructor.constructorArgs.sort((a, b) => a.prop > b.prop ? 1 : -1).map((value) => value.value);
      let constructedValue = new constructor(...finalArgs);
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
    Object.defineProperty(frameConstructor, "styles", { value: frameArgs.styles, writable: false });
    Object.defineProperty(frameConstructor, "markup", { value: frameArgs.markup, writable: false });
    Object.defineProperty(frameConstructor, "marker", { value: frameArgs.marker, writable: false });
    Object.defineProperty(frameConstructor, "name", { value: constructor.name, writable: false });
    Object.defineProperty(frameConstructor, "isFrame", { value: true, writable: false });
    return frameConstructor;
  }
  return frame;
}

// src/decorators/injectable.ts
function Injectable() {
  function injectable(constructor) {
    Object.defineProperty(constructor, "name", { value: constructor.name, writable: false });
    Object.defineProperty(constructor, "isInjectable", { value: true, writable: false });
    window.dependencies.addService(constructor);
  }
  return injectable;
}
function Inject(component) {
  return function injected(target, propKey, descriptor) {
    let injector = window.dependencies;
    let service = injector.getService(component.prototype.constructor.name);
    if (Object.hasOwn(target, "constructorArgs")) {
      Object.assign(target.constructorArgs, [...target.constructorArgs, {
        prop: descriptor,
        value: service.service
      }]);
    } else {
      Object.defineProperty(target, "constructorArgs", { value: [
        {
          prop: descriptor,
          value: service.service
        }
      ], writable: true });
    }
  };
}

// src/index.ts
var depinj = new DependencyInjector;
window.dependencies = depinj;

class Something {
  value = "World!";
  getWorld = () => {
    return this.value;
  };
}
Something = __decorateClass([
  Injectable()
], Something);

class SuperCool {
  value = "Super Cool Component";
  constructor(something) {
    console.log(something.getWorld());
  }
}
SuperCool = __decorateClass([
  Frame({
    styles: `
.super-cool {
    width: 75px;
    background: pink;
    color: black;
}
    `,
    markup: [
      {
        attributes: [{ key: "class", value: "super-cool" }],
        children: [],
        selector: "div",
        usedInComponent: SuperCool,
        content: {
          key: "",
          value: "Hello from {{value}}",
          isExpression: true
        }
      }
    ],
    marker: "FrameSuperCool"
  }),
  __decorateParam(0, Inject(Something))
], SuperCool);

class Another {
  value;
  constructor(something) {
    this.value = something.getWorld();
    console.log(this.value);
  }
}
Another = __decorateClass([
  Frame({
    styles: `
.something {
    width: 100px;
    height: 100px;
    background: blue;
    color: white;
}
    `,
    markup: [
      {
        attributes: [{ key: "class", value: "something" }],
        children: [
          {
            attributes: [],
            children: [],
            selector: "FrameSuperCool",
            usedInComponent: Another,
            content: { key: "", value: "" },
            usesComponent: SuperCool
          }
        ],
        selector: "div",
        usedInComponent: Another,
        content: {
          key: "",
          value: "Hello {{value}}",
          isExpression: true
        }
      }
    ],
    marker: "FrameAnother"
  }),
  __decorateParam(0, Inject(Something))
], Another);

class MainCapsule {
}
MainCapsule = __decorateClass([
  Capsule({
    Capsules: [],
    Components: [
      Another
    ],
    Exports: [],
    Init: Another
  })
], MainCapsule);
createWebPage(MainCapsule);
