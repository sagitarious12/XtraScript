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

// src/index.ts
function Frame(args) {
  function frame(constructor) {
    function frameConstructor() {
      let constructedValue;
      if (constructor.prototype.constructor.constructorArgs) {
        const finalArgs = constructor.prototype.constructor.constructorArgs.sort((a, b) => a.prop > b.prop ? 1 : -1).map((value) => value.value);
        constructedValue = new constructor(...finalArgs);
      } else {
        constructedValue = new constructor;
      }
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
    getHtml(args.markup, (html) => {
      getStyles(args.styles, html, (results) => {
        const element = defineElement(args.marker, results.html, results.css);
        Object.defineProperty(frameConstructor, "content", { value: element });
      });
    });
    return frameConstructor;
  }
  return frame;
}
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
var defineElement = (elementName, elem, styles) => {
  customElements.define(elementName, class extends HTMLElement {
    constructor() {
      super();
      const shadowRoot = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.appendChild(document.createTextNode(styles));
      shadowRoot.appendChild(style);
      shadowRoot.appendChild(elem.content.cloneNode(true));
    }
  });
};
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
var isNumeric = (str) => {
  if (typeof str != "string")
    return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};

class Component {
  constructor() {
    console.log(this);
  }
}
Component = __decorateClass([
  Frame({
    markup: "./something.html",
    styles: "./something.css",
    marker: "some-component"
  })
], Component);

class Another {
  constructor() {
    this.someValue = 1;
  }
}
__decorateClass([
  Prop()
], Another.prototype, "someValue", 2);
Another = __decorateClass([
  Frame({
    markup: "./another.html",
    styles: "./another.css",
    marker: "another-component"
  })
], Another);
export {
  isNumeric,
  Prop,
  Frame,
  Component,
  Another
};
