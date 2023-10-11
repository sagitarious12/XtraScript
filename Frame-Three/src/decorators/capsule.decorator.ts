import { Constructor } from "../core/types";

export interface CapsuleArgs {
  Components?: Constructor<any>[];
  Capsules?: Constructor<any>[];
  Exports?: Constructor<any>[];
}

export function Capsule(capsuleArgs: CapsuleArgs) {
  function module(constructor: any) {
    function moduleConstructor(...args: any[]) {
      let constructed = new constructor(...args);
      
      return constructed;
    }
    capsuleArgs.Capsules?.forEach((value: Constructor<void>) => {
      if ((value as any).isRouter) {
        Object.defineProperty(moduleConstructor, 'router', { value: value, writable: false });
      }
    });
    Object.defineProperty(moduleConstructor, 'name', { value: constructor.name, writable: false });
    return <any>moduleConstructor;
  }
  return module;
}