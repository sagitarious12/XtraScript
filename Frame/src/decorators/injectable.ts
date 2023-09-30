import { Component } from "../types/baseTypes";

export function Injectable() {
  function injectable(constructor) {
    Object.defineProperty(constructor, 'name', { value: constructor.name, writable: false });
    Object.defineProperty(constructor, 'isInjectable', { value: true, writable: false });
    (window as any).dependencies.addService(constructor);
  }
  return injectable;
}

export function Inject(component: Component) {
  return function injected(target: any, propKey: any, descriptor: any) {
    let injector = (window as any).dependencies;
    let service = injector.getService(component.prototype.constructor.name);
    if (Object.hasOwn(target, 'constructorArgs')) {
      Object.assign(target.constructorArgs, [...target.constructorArgs, {
        prop: descriptor,
        value: service
      }])
    } else {
      Object.defineProperty(target, 'constructorArgs', { value: [
        {
          prop: descriptor,
          value: service
        }
      ], writable: true });
    }
  }
}