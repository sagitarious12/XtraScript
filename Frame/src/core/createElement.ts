import { ElementData, Statement } from "../types/baseTypes";
import { htmlTags } from "../types/tags";
import { getComponentValue } from "./componentValue";
import { createOnChanges } from "./onChanges";

export const createElement = (data: ElementData, component: void, shadow: ShadowRoot | null = null, parentComponent: void | null = null): HTMLElement => {

    const camelToDashCase = str => str.split(/\.?(?=[A-Z])/).join('-').toLowerCase();
    const el = document.createElement(htmlTags.includes(data.selector) ? data.selector : camelToDashCase(data.selector));

    let shadowRoot;
    if (shadow === null) {
        shadowRoot = el.attachShadow({ mode: 'closed'});
    } else {
        shadowRoot = shadow;
    }
    
    console.log((data as any).styleContent);
    if ((data as any).styleContent) {
        const style = document.createElement('style');
        style.textContent = (data as any).styleContent;
        shadowRoot.appendChild(style);
    }

    data.attributes.forEach((statement: Statement) => {
        if (statement.key.includes('[') && statement.key.includes(']')) {
            if (parentComponent) {
                const value = statement.key.replace('[', '').replace(']', '');
                component[value] = getComponentValue(parentComponent, statement);;
            }
        } else if (statement.key.includes('(') && statement.key.includes(')')) {
            if (parentComponent) {
                const value = statement.key.replace('(', '').replace(')', '');
                component[value] = parentComponent[statement.value];
            }
        } else if (statement.key.includes('$')) {
            el.addEventListener(statement.key.replace('$', ''), component[statement.value]);
        } else {
            el.setAttribute(statement.key, getComponentValue(component, statement)); 
        }
    });

    if (data.content && data.content.value !== "") {
        if (data.content.isExpression) {
            el.textContent = getComponentValue(component, data.content);
        } else {
            el.textContent = data.content.value;
        }
    }   

    const isChildComponentSame = (child: ElementData) => {
        if (child.usesComponent || data.usesComponent) {
            if (shadow) {
                return child.usesComponent?.name === data.usedInComponent.name;
            } else {
                return child.usedInComponent.name === data.usesComponent?.name
            }
        }
        return child.usedInComponent.name === data.usedInComponent.name;
    }

    data.children.forEach((child: ElementData) => {
        let childComponent: void;
        if (!isChildComponentSame(child) && child.usesComponent) {
            console.log(child.usesComponent.prototype);
            childComponent = (window as any).dependencies.instantiate(child.usesComponent);
            console.log(child.usesComponent.prototype);
            child.usesComponent.prototype.constructor.markup.forEach((element: ElementData) => {
                child.children.push(element);
            })
            child = Object.assign(child, {styleContent: child.usesComponent.prototype.constructor.styles});
        } else {
            childComponent; // should not matter, this should never be used.
        }

        if (shadow !== null) {
            el.appendChild(createElement(
                child, 
                isChildComponentSame(child) ? 
                    component : 
                    childComponent, 
                isChildComponentSame(child) ?
                    shadowRoot :
                    null,
                !isChildComponentSame(child) ?
                    component :
                    null
            ));
        } else {
            shadowRoot.appendChild(createElement(
                child, 
                isChildComponentSame(child) ? 
                    component : 
                    childComponent, 
                isChildComponentSame(child) ?
                    shadowRoot :
                    null,
                !isChildComponentSame(child) ?
                    component :
                    null
            ));
        }
    });
    
    createOnChanges(component, el, data, parentComponent);

    return el;
}