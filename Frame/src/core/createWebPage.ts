import { ElementData } from "../types/baseTypes";
import { createElement } from "./createElement";

export const createWebPage = (data: ElementData[]) => {
    data.forEach((element: ElementData) => {
        let component = new element.usedInComponent(...element.componentArgs);
        document.body.appendChild(createElement(element, component, null));
    });
}