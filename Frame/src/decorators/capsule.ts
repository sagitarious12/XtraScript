import { Component } from "../types/baseTypes";

export interface CapsuleArgs {
  Injectable: Component[];
  Component: Component[];
  Capsule: Component[];
  Export: Component[];
}

export function Capsule(capsuleArgs: CapsuleArgs) {
  function module(constructor) {
    function moduleConstructor(...args: any[]) {
      let constructed = new constructor(...args);
      
      return constructed;
    }
    Object.defineProperty(moduleConstructor, 'name', { value: constructor.name, writable: false });
    Object.defineProperty(moduleConstructor, 'isCapsule', { value: true, writable: false });
    return <any>moduleConstructor;
  }
  return module;
}