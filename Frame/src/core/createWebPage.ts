import { Component, ElementData } from "../types/baseTypes";
import { createElement } from "./createElement";

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
    } else {
        console.error("Must supply a Capsule to Create Web Page");
    }
}