import { Constructor, ConstructorArgs } from "./types";

interface instantiatedServices {
  name: string;
  service: void;
}

export class DependencyInjector {

  private services: instantiatedServices[] = [];

  addService = (service: Constructor<void>): void => {
    const args = service
      .prototype
      .constructor
      .constructorArgs
      ?.sort((a: ConstructorArgs, b: ConstructorArgs) => a.prop > b.prop ? 1 : -1)
      .map((value: ConstructorArgs) => value.value);
    let srv;
    if (args) {
      srv = new service(...args);
    } else {
      srv = new service();
    }
    this.services.push(
      {
        name: service.prototype.constructor.name,
        service: srv
      }
    );
    return srv;
  }

  instantiate = (service: Constructor<void>): void => {
    return new service.prototype.constructor();
  }

  getService = (component: string): any => {
    const found = this.services.find((value: instantiatedServices) => {
      return value.name === component;
    });
    if (found) {
      return found.service;
    } 
    console.error("Invalid Dependency Injection, No Valid Service Found");
    return null;
  }
}