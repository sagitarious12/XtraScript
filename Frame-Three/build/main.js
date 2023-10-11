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

// src/decorators/capsule.decorator.ts
function Capsule(capsuleArgs) {
  function module(constructor) {
    function moduleConstructor(...args) {
      let constructed = new constructor(...args);
      return constructed;
    }
    capsuleArgs.Capsules?.forEach((value) => {
      if (value.isRouter) {
        Object.defineProperty(moduleConstructor, "router", { value, writable: false });
      }
    });
    Object.defineProperty(moduleConstructor, "name", { value: constructor.name, writable: false });
    return moduleConstructor;
  }
  return module;
}
// src/core/utils.ts
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

// src/core/types.ts
var TokenType;
(function(TokenType2) {
  TokenType2[TokenType2["ident"] = 0] = "ident";
  TokenType2[TokenType2["add"] = 1] = "add";
  TokenType2[TokenType2["sub"] = 2] = "sub";
  TokenType2[TokenType2["mult"] = 3] = "mult";
  TokenType2[TokenType2["div"] = 4] = "div";
  TokenType2[TokenType2["open_paren"] = 5] = "open_paren";
  TokenType2[TokenType2["close_paren"] = 6] = "close_paren";
  TokenType2[TokenType2["open_bracket"] = 7] = "open_bracket";
  TokenType2[TokenType2["close_bracket"] = 8] = "close_bracket";
  TokenType2[TokenType2["comma"] = 9] = "comma";
  TokenType2[TokenType2["function"] = 10] = "function";
  TokenType2[TokenType2["dot"] = 11] = "dot";
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
var parseExpressionConditional = (component, expression, indexMap = null) => {
  if (Array.isArray(expression)) {
    let result = "";
    for (let i = 0;i < expression.length; i++) {
      if (expression[i].isExpression) {
        const tokens = getTokens(expression[i].value.split(""));
        const parseResult = parseStatement(component, tokens, indexMap);
        if (parseResult !== undefined && parseResult !== null) {
          if (parseResult.value) {
            result += parseResult.value + " ";
          } else {
            if (Array.isArray(parseResult)) {
              result += JSON.stringify(parseResult);
            } else {
              result += parseResult;
            }
          }
        } else {
          console.error("Invalid parsed value:", expression[i].value);
        }
      }
    }
    return result;
  } else {
    const tokens = getTokens(expression.value.split(""));
    const result = parseStatement(component, tokens, indexMap);
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
    } else if (chars[i] === "[") {
      tokens.push({ type: TokenType.open_bracket });
      continue;
    } else if (chars[i] === "]") {
      tokens.push({ type: TokenType.close_bracket });
      continue;
    } else if (chars[i] === ".") {
      tokens.push({ type: TokenType.dot });
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
var parseStatement = (component, tokens, indexMap) => {
  let i = 0;
  const parse = (t, checkComponent = true) => {
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
    } else if (t[i].type === TokenType.ident && i + 1 < t.length && t[i + 1].type === TokenType.open_bracket) {
      const currentToken = t[i];
      i++;
      i++;
      const bracketTokens = [];
      while (t[i].type !== TokenType.close_bracket) {
        bracketTokens.push(t[i++]);
      }
      const bracketResult = parseStatement(component, bracketTokens, indexMap);
      runningValue = component[currentToken.value][bracketResult];
      i++;
    } else {
      if (indexMap && t[i].type === TokenType.ident && indexMap[t[i].value] !== undefined) {
        runningValue = indexMap[t[i].value];
      } else if (t[i].value && t[i].value[0] === '"') {
        runningValue = t[i].value;
      } else if (t[i].value[0].match(/[0-9]/i)) {
        runningValue = parseInt(t[i].value);
      } else {
        try {
          if (checkComponent) {
            runningValue = component[t[i].value];
          } else {
            runningValue = t[i].value;
          }
          i++;
        } catch (e) {
          return t[i].value;
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
      } else if (t[i].type === TokenType.dot) {
        i++;
        const res = parse(t, false);
        return runningValue[res];
      }
    }
    return runningValue;
  };
  return parse(tokens);
};
var shouldChangeTextNode = (node) => {
  return true;
};
var shouldChangeCustomNode = (node) => {
  return true;
};
var shouldChangeForNode = (node) => {
  return true;
};
// src/core/element.ts
var isInputPropAttribute = (name) => name[0] === "[" && name[name.length - 1] === "]";
var stripBracketsFromAttribute = (name) => name.replace("[", "").replace("]", "");
var isHTMLExpression = (value) => value.includes("}}") && value.includes("}}");
var htmlTags = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "math", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "search", "section", "select", "slot", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"];
var eventNames = ["abort", "afterprint", "animationend", "animationiteration", "animationstart", "beforeprint", "beforeunload", "blur", "canplay", "canplaythrough", "change", "click", "contextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "ended", "error", "focus", "focusin", "focusout", "fullscreenchange", "fullscreenerror", "hashchange", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "message", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "offline", "open", "pagehide", "pageshow", "paste", "pause", "play", "playing", "popstate", "progress", "ratechange", "resize", "reset", "scroll", "search", "seeked", "seeking", "select", "show", "stalled", "storage", "submit", "suspend", "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitionend", "unload", "volumechange", "waiting", "wheel"];
var ChangableNodeTypes;
(function(ChangableNodeTypes2) {
  ChangableNodeTypes2[ChangableNodeTypes2["CUSTOM"] = 0] = "CUSTOM";
  ChangableNodeTypes2[ChangableNodeTypes2["TEXT"] = 1] = "TEXT";
  ChangableNodeTypes2[ChangableNodeTypes2["FOR"] = 2] = "FOR";
})(ChangableNodeTypes || (ChangableNodeTypes = {}));
var defineElement = (selector, html, styles, component) => {

  class EL extends HTMLElement {
    component;
    changableNodes = [];
    hasRunChangeDetection = false;
    eventListeners = [];
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
      this.initializeComponent();
      this.setupComponentProxies();
      this.setChangableNodes();
      this.checkTheseAttributes(this.attributes);
      if (!this.hasRunChangeDetection) {
        this.performChangeDetection(this);
      }
    }
    initializeComponent = () => {
      let finalArgs = [];
      if (component.prototype.constructor.constructorArgs) {
        finalArgs = component.prototype.constructor.constructorArgs.sort((a, b) => a.prop > b.prop ? 1 : -1).map((value) => value.value);
      }
      this.component = new component(...finalArgs);
    };
    setupComponentProxies = () => {
      Object.keys(this.component).forEach((key) => {
        this.setupProxyForKey(key);
      });
      Object.keys(component.prototype).forEach((key) => {
        this.setupProxyForKey(key);
      });
    };
    checkTheseAttributes = (attributes, performChangeDetection = true) => {
      for (let i = 0;i < attributes.length; i++) {
        let attr = attributes.item(i);
        if (isInputPropAttribute(attr.name)) {
          let strippedName = stripBracketsFromAttribute(attr.name);
          let prev = this.component[strippedName];
          let current;
          if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
            const result = parseExpressionConditional(this.parent, getExpressions(attr.nodeValue));
            current = result;
            this.component[strippedName] = result;
          } else {
            current = attr.nodeValue;
            this.component[strippedName] = attr.nodeValue;
          }
          if (this.component.onChanges) {
            this.component.onChanges({
              [strippedName]: {
                current,
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
      this.eventListeners.forEach((ev) => {
        ev.node.removeEventListener(ev.eventName, ev.eventFn);
      });
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
        if (node.nodeName === "#comment")
          return;
        if (node.attributes) {
          let attrs = node.attributes;
          for (let i = 0;i < attrs.length; i++) {
            let attr = attrs.item(i);
            if (attr.name.includes("$")) {
              let eventName = attr.name.replace("$", "");
              if (eventNames.includes(eventName)) {
                let fnName = attr.nodeValue;
                if (fnName && this.component[fnName]) {
                  const eventFn = () => {
                    this.component[fnName]();
                  };
                  node.addEventListener(eventName, eventFn);
                  this.eventListeners.push({ eventName, eventFn, node });
                } else {
                  console.error(`Invalid ${eventName} event listener: function "${fnName}" does not exist on type ${this.component.constructor.name}`);
                }
              } else {
                console.error(`Invalid event name: ${eventName}. See https://www.w3schools.com/jsref/dom_obj_event.asp for accepted values.`);
              }
            }
          }
        }
        if (node.childNodes.length > 0) {
          node.childNodes.forEach((child) => {
            if (child.dataset && child.dataset.for) {
              const loopNode = child.cloneNode(true);
              const template = document.createElement("template");
              template.content.append(loopNode);
              while (node.firstChild) {
                node.removeChild(node.firstChild);
              }
              this.changableNodes.push({ type: ChangableNodeTypes.FOR, node, loopNode: template });
              return;
            }
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
      if (!this.hasRunChangeDetection) {
        this.hasRunChangeDetection = true;
      }
      _this.changableNodes.forEach((node) => {
        if (node.type === ChangableNodeTypes.TEXT && shouldChangeTextNode(node)) {
          const expressions = getExpressions(node.node["permanentValue"]);
          const expressionResult = parseExpressionConditional(_this.component, expressions);
          node.node.nodeValue = expressionResult;
          return;
        }
        if (node.type === ChangableNodeTypes.CUSTOM && shouldChangeCustomNode(node)) {
          for (let i = 0;i < node.node["permanentAttributes"].length; i++) {
            let attr = node.node["permanentAttributes"][i];
            let strippedName = stripBracketsFromAttribute(attr.name);
            if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
              const expressions = getExpressions(attr.nodeValue);
              const exprResult = parseExpressionConditional(_this.component, expressions);
              node.node.setAttribute(`data-${strippedName}`, exprResult);
            }
          }
          return;
        }
        if (node.type === ChangableNodeTypes.FOR && shouldChangeForNode(node)) {
          while (node.node.firstChild) {
            node.node.removeChild(node.node.firstChild);
          }
          let forExpr = node.loopNode.content.firstChild.dataset.for;
          if (typeof forExpr === "string") {
            const exprs = getExpressions(forExpr);
            const exprResult = JSON.parse(parseExpressionConditional(this.component, exprs));
            exprResult.forEach((v, i) => {
              const newNode = node.loopNode.content.cloneNode(true);
              node.node.appendChild(newNode);
            });
            const setExpressions = (setNode, indexMap) => {
              if (setNode.nodeName === "STYLE")
                return;
              if (setNode.childNodes.length > 0) {
                setNode.childNodes.forEach((child) => {
                  setExpressions(child, indexMap);
                });
              }
              if (setNode.nodeName === "#text") {
                const expressions = getExpressions(setNode.nodeValue);
                const expressionResult = parseExpressionConditional(_this.component, expressions, indexMap);
                setNode.nodeValue = expressionResult;
              }
              if (setNode.localName && !htmlTags.includes(setNode.localName)) {
                for (let i = 0;i < node.node.attributes.length; i++) {
                  let attr = node.node.attributes[i];
                  let strippedName = stripBracketsFromAttribute(attr.name);
                  if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
                    const expressions = getExpressions(attr.nodeValue);
                    const exprResult2 = parseExpressionConditional(_this.component, expressions, indexMap);
                    node.node.setAttribute(`data-${strippedName}`, exprResult2);
                  }
                }
                return;
              }
            };
            node.node.childNodes.forEach((child, index) => {
              let indexMap = {};
              indexMap[`${node.node.firstChild.dataset.index}`] = index;
              setExpressions(child, indexMap);
            });
          } else {
            console.error("For Loop Invalid", forExpr);
          }
        }
      });
    };
    setupProxyForKey = (key) => {
      let k = Symbol();
      let currentValue = this.component[key];
      const getter = () => {
        return this.component[k] || currentValue;
      };
      const setter = (newVal) => {
        this.component[k] = newVal;
        this.performChangeDetection(this);
      };
      Object.defineProperty(this.component, key, {
        get: getter,
        set: setter,
        enumerable: true
      });
    };
  }
  customElements.define(selector, EL);
};

// src/decorators/frame-decorator.ts
function Frame(args) {
  function ctor(constructor) {
    getHtml(args.markup, (html) => {
      getStyles(args.styles, html, (results) => {
        defineElement(args.marker, results.html, results.css, constructor);
      });
    });
    Object.defineProperty(constructor, "selector", { value: args.marker, writable: false });
    return constructor;
  }
  return ctor;
}
// src/core/dependency-injection.ts
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
      return found.service;
    }
    console.error("Invalid Dependency Injection, No Valid Service Found");
    return null;
  };
}

// src/decorators/injectable-decorator.ts
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
        value: service
      }]);
    } else {
      Object.defineProperty(target, "constructorArgs", { value: [
        {
          prop: descriptor,
          value: service
        }
      ], writable: true });
    }
  };
}
var depinj = new DependencyInjector;
window.dependencies = depinj;
// src/core/router.ts
class RouterCapsule {
  static isRouter = true;
  static routes = [];
  static childRoutes = {};
  static activePath = "";
  static activePathParams = {};
  static setRootRoutes = (routes) => {
    this.routes = routes;
    const hasDefault = this.routes.find((r) => r.default);
    if (hasDefault) {
      const interval = setInterval(() => {
        if (customElements.get(hasDefault.component.prototype.constructor.selector)) {
          this.setRoute(hasDefault.path, { params: hasDefault.defaultParams || {} });
          clearInterval(interval);
        }
      }, 100);
    }
    return RouterCapsule;
  };
  static setChildRoutes = (routes, capsule2) => {
    this.childRoutes[capsule2.prototype.constructor.name] = routes;
    return RouterCapsule;
  };
  static getRoutes = (component) => {
    const foundChild = Object.keys(this.childRoutes).find((value) => value === component.prototype.constructor.name);
    if (!foundChild) {
      return this.routes;
    } else {
      return foundChild;
    }
  };
  static setRoute = (path, options = {}) => {
    const pathSplit = path.split("?");
    const route = this.routes.find((r) => r.path === pathSplit[0]);
    if (route) {
      let path2 = route.path;
      if (options.params && Object.keys(options.params).length > 0) {
        this.activePathParams = options.params;
        let params = [];
        Object.keys(options.params).forEach((key) => {
          params.push(`${key}=${options.params[key]}`);
        });
        path2 += `?${params.join("&")}`;
      }
      history.pushState(null, "", path2);
      RouterFeed.setRouteContent(route);
    } else {
      let childRoute;
      Object.keys(this.childRoutes).forEach((value) => {
        const found = this.childRoutes[value].find((r) => r.path == pathSplit[0]);
        if (found) {
          childRoute = found;
        }
      });
      if (childRoute) {
        history.pushState(null, "", childRoute.path);
        RouterFeed.setRouteContent(childRoute);
      } else {
        console.error(`No Valid Route Found That Matches Path Supplied To Router: ${path}`);
        let routes = [...this.routes];
        Object.keys(this.childRoutes).forEach((c) => routes.push(...this.childRoutes[c]));
        console.error("Available Routes", routes);
      }
    }
  };
  static getActiveRoute = () => {
    return this.activePath;
  };
  static getActiveRouteParams = () => {
    return this.activePathParams;
  };
}

class RouterService {
  setRoute = (path, options = {}) => {
    RouterCapsule.setRoute(path, options);
  };
  getUrl = () => {
    return RouterCapsule.getActiveRoute();
  };
  getParams = () => {
    return RouterCapsule.getActiveRouteParams();
  };
}
RouterService = __decorateClass([
  Injectable()
], RouterService);

class RouterFeed extends HTMLElement {
  static _root;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const el = document.createElement("span");
    el.setAttribute("id", "router-feed");
    this.shadowRoot?.append(el);
    RouterFeed._root = this.shadowRoot;
  }
  static setRouteContent = (route) => {
    const selector = route.component.prototype.constructor.selector;
    const elem = customElements.get(selector);
    if (elem) {
      RouterFeed.#setRoute(selector);
    } else {
      console.error(`No element exists in the element registry for selector: ${selector}`);
    }
  };
  static #setRoute = (selector) => {
    const element2 = document.createElement(selector);
    const span = document.createElement("span");
    span.setAttribute("id", "router-feed");
    span.appendChild(element2);
    this._root?.replaceChildren(span);
  };
}
customElements.define("router-feed", RouterFeed);

// src/core/state.ts
class Term {
  v;
  constructor(v) {
    this.v = v;
  }
  get value() {
    return this.v;
  }
  set setValue(v) {
    this.v = v;
  }
}

class Contract {
  terms;
  proxies = [];
  getTerms = () => {
    const _this = this;
    const resultTerms = this.terms.reduce((acc, term) => {
      return Object.assign(acc, { [term.name]: term.term.value });
    }, {});
    resultTerms["uuid"] = Symbol();
    resultTerms["unsubscribe"] = function() {
      _this.proxies = _this.proxies.filter((p) => p.uuid !== this.uuid);
    };
    resultTerms["onChanges"] = function(cb) {
      _this.proxies.push({
        uuid: this.uuid,
        cb,
        proxy: new Proxy(this, {
          set: function(target, key, value) {
            target[key] = value;
            cb(target);
            return true;
          }
        })
      });
    };
    return resultTerms;
  };
  getTerm = (name) => {
    return this.terms.find((term) => term.name === name)?.term.value;
  };
  setTerm = (name, value) => {
    const terms = this.terms.find((term) => term.name === name);
    if (terms) {
      terms.term.setValue = value;
      if (this.proxies.length > 0) {
        this.proxies.forEach((prox) => {
          prox.proxy[name] = value;
        });
      }
    }
  };
}

class StateService {
  getContract = (c) => {
    return State.getContract(c);
  };
}
StateService = __decorateClass([
  Injectable()
], StateService);

class State {
  static isState = true;
  static contracts;
  static setStates = (contracts) => {
    this.contracts = contracts.map((c) => {
      const contract = new c;
      if (("getTerms" in contract) && ("getTerm" in contract)) {
        return {
          name: c.prototype.constructor.name,
          contract
        };
      }
      return null;
    }).filter((i) => i !== null);
    return State;
  };
  static getContract = (c) => {
    return this.contracts.find((value) => value.name === c.prototype.constructor.name)?.contract;
  };
}

// src/main.ts
class ComponentService {
  value = "Hello From Component Service";
  getValue = () => {
    return this.value;
  };
}
ComponentService = __decorateClass([
  Injectable()
], ComponentService);

class Component {
  router;
  arr = [
    { obj: "Hello" }
  ];
  arr2 = [1, 2, 3];
  arr3 = ["hello", "world"];
  arr4 = ["Slot Value 1", "Slot Value 2"];
  testStateContract;
  constructor(componentService, routerService, state2) {
    this.router = routerService;
    this.testStateContract = state2.getContract(TestState);
    setTimeout(() => {
      this.testStateContract.setTestValue("Some New Value From Test Term");
    }, 2000);
    setTimeout(() => {
      this.arr = [...this.arr, { obj: componentService.getValue() }];
    }, 2000);
  }
  child = () => {
    this.router.setRoute("/");
  };
  childTwo = () => {
    this.router.setRoute("/child-two");
  };
}
Component = __decorateClass([
  Frame({
    marker: "frame-component",
    markup: "./frame/frame.html",
    styles: "./frame/frame.css"
  }),
  __decorateParam(0, Inject(ComponentService)),
  __decorateParam(1, Inject(RouterService)),
  __decorateParam(2, Inject(StateService))
], Component);

class ChildComponent {
  some_text = "Hello Child Component";
  router;
  terms;
  testValue = "Default Test Value Value";
  constructor(routerService, state2) {
    this.router = routerService;
    this.terms = state2.getContract(TestState)?.getTerms();
    this.terms.onChanges((value) => {
      this.testValue = value.test;
    });
  }
  onDestroy = () => {
    this.terms.unsubscribe();
  };
}
ChildComponent = __decorateClass([
  Frame({
    marker: "frame-child-component",
    markup: "./frame-child/child.html",
    styles: "./frame-child/child.css"
  }),
  __decorateParam(0, Inject(RouterService)),
  __decorateParam(1, Inject(StateService))
], ChildComponent);

class ChildComponentTwo {
  some_text = "Hello Child Component";
}
ChildComponentTwo = __decorateClass([
  Frame({
    marker: "frame-child-component-two",
    markup: "./frame-child-two/child.html",
    styles: "./frame-child-two/child.css"
  })
], ChildComponentTwo);

class TestState extends Contract {
  constructor() {
    super();
    this.terms = [{ name: "test", term: new Term("Some Value From Test Term") }];
  }
  setTestValue = (value) => {
    this.setTerm("test", value);
  };
}
var routes = [
  {
    component: ChildComponent,
    path: "/",
    title: "Child Component",
    default: true
  },
  {
    component: ChildComponentTwo,
    path: "/child-two",
    title: "Child Two Component"
  }
];

class ComponentCapsule {
}
ComponentCapsule = __decorateClass([
  Capsule({
    Capsules: [
      RouterCapsule.setRootRoutes(routes),
      State.setStates([TestState])
    ],
    Components: [
      Component,
      ChildComponent
    ]
  })
], ComponentCapsule);
