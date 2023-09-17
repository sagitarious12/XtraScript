import { Component } from "../types/baseTypes";

export interface CapsuleArgs {
  Components?: Component[];
  Capsules?: Component[];
  Exports?: Component[];
  Init?: Component;
}

export function Capsule(capsuleArgs: CapsuleArgs) {
  function module(constructor) {
    function moduleConstructor(...args: any[]) {
      let constructed = new constructor(...args);
      
      return constructed;
    }
    if (capsuleArgs.Init) {
      Object.defineProperty(moduleConstructor, 'initComponent', { value: capsuleArgs.Init, writable: false });
    }
    Object.defineProperty(moduleConstructor, 'name', { value: constructor.name, writable: false });
    Object.defineProperty(moduleConstructor, 'isCapsule', { value: true, writable: false });
    return <any>moduleConstructor;
  }
  return module;
}