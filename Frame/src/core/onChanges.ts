import { FrameChanges } from "../decorators/frame";
import { ElementData, Statement } from "../types/baseTypes";
import { getComponentValue } from "./componentValue";

export const createOnChanges = (component: any, el: HTMLElement, data: ElementData, parentComponent: any = null, continueIterating: boolean = true) => {
    let originalOnChanges = component.onChanges;
    component.onChanges = (changes: FrameChanges) => {
        
        if (Object.keys(changes).length > 0 ) {

            data.attributes.forEach((statement: Statement) => {
                if (statement.key.includes('$')) return;
                
                if (statement.key.includes('[') && statement.key.includes(']')) {
                    if (parentComponent) {
                        const value = statement.key.replace('[', '').replace(']', '');
                        const protoKeys = Object.keys(Object.getPrototypeOf(parentComponent));
                        const mainKeys = Object.keys(parentComponent);
                        const allKeys = [...protoKeys, ...mainKeys];
                        if (allKeys.includes(value)) {
                            parentComponent[value] = getComponentValue(component, statement);
                        }
                    }
                } else if (statement.key.includes('(') && statement.key.includes(')')) {
                    if (parentComponent) {
                        const value = statement.key.replace('(', '').replace(')', '');
                        const protoKeys = Object.keys(Object.getPrototypeOf(parentComponent));
                        const mainKeys = Object.keys(parentComponent);
                        const allKeys = [...protoKeys, ...mainKeys];
                        if (allKeys.includes(value)) {
                            parentComponent[value] = component[statement.value];
                        }
                    }
                }  else {
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
        }
        
        if (originalOnChanges) {
            originalOnChanges(changes);
        }
    }

    if (parentComponent && continueIterating) {
        createOnChanges(parentComponent, el, data, component, false);
    }
}