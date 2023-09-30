import { Component, ElementData } from "../types/baseTypes";
import { createElement } from "./createElement";
import { Route, RouterCapsule, RouterService } from "./router";

export const createWebPage = (capsule: Component) => {
    if (capsule.prototype.constructor.isCapsule) {
        const cap = capsule.prototype.constructor;
        const selector = cap.initComponent.prototype.constructor.marker;
        let component = (window as any).dependencies.instantiate(cap.initComponent);
        let rootElement: ElementData = {
            attributes: [],
            children: cap.initComponent.prototype.constructor.markup,
            selector,
            usedInComponent: cap.initComponent,
            content: {key: '', value: ''},
        }
        rootElement = Object.assign(rootElement, {styleContent: cap.initComponent.prototype.constructor.styles});
        document.body.appendChild(createElement(rootElement, component, null));

        
        if (cap.router) {
            const service = (window as any).dependencies.getService(RouterService.prototype.constructor.name);
            const routes: Route[] = cap.router.getRoutes(capsule);
            const defaultRoute = routes.find((value: Route) => value.default);
            if (defaultRoute) {
                service.setRoute(defaultRoute.path);
            } else {
                console.error("Must supply a default route in the root capsule");
            }
        }
    } else {
        console.error("Must supply a Capsule to Create Web Page");
    }
}

export const createRouterElements = (component: Component): HTMLElement => {

    const selector = component.prototype.constructor.marker;
    let comp = (window as any).dependencies.instantiate(component);
    RouterCapsule.addActiveComponent(comp);
    let rootElement: ElementData = {
        attributes: [],
        children: component.prototype.constructor.markup,
        selector,
        usedInComponent: component,
        content: {key: '', value: ''},
    }
    rootElement = Object.assign(rootElement, {styleContent: component.prototype.constructor.styles});
    return createElement(rootElement, comp, null, null, true);
}