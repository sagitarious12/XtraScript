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
    return new service;
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

// src/decorators/frame.ts
function Frame() {
  function frame(constructor) {
    function frameConstructor(args) {
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
  value = "Hello World";
}
Something = __decorateClass([
  Injectable()
], Something);

class SomethingElse {
  value = "Another Hello World";
  constructor(something) {
    console.log(something.value);
    something.value = "Another Thing";
  }
}
SomethingElse = __decorateClass([
  Injectable(),
  __decorateParam(0, Inject(Something))
], SomethingElse);

class Another {
  constructor(something, somethingElse) {
    console.log(something.value);
    console.log(somethingElse.value);
  }
}
Another = __decorateClass([
  Frame(),
  __decorateParam(0, Inject(Something)),
  __decorateParam(1, Inject(SomethingElse))
], Another);
depinj.instantiate(Another);
