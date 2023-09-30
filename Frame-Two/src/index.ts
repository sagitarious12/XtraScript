/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

const defineElement = (elementName: string, elem: HTMLTemplateElement, styles: string) => {
    customElements.define(elementName, 
        class extends HTMLElement {

            constructor() {
                super();
                const shadowRoot = this.attachShadow({ mode: 'open' });
                const style: HTMLStyleElement = document.createElement('style');
                style.appendChild(document.createTextNode(styles));
                shadowRoot.appendChild(style);
                shadowRoot.appendChild(elem.content.cloneNode(true));
            }
        });
}

const getHtml = (path: string, resolve: (value: HTMLTemplateElement) => void): void => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            console.error("COULD NOT FIND HTML FILE WITH PATH", path);
            throw 'Failed to retrieve html file';
        }
        const template = document.createElement('template');
        template.innerHTML = xhr.response;
        resolve(template);
    }
    xhr.open('GET', path, true);
    xhr.send();
}

const getStyles = (path: string, html: HTMLTemplateElement, resolve: (value: {css: string, html: HTMLTemplateElement}) => void): void => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            console.error("COULD NOT FIND CSS FILE WITH PATH", path);
            throw 'Failed to retrieve css file';
        }
        resolve({css: xhr.response, html});
    }
    xhr.open('GET', path, true);
    xhr.send();
} 

export interface FrameChanges {
    [key: string]: {
        previous: any;
        current: any;
    }
}

export interface FrameArgs {
    styles: string;
    markup: string;
    marker: string;
}

export interface ConstructorArgs {
    prop: number; 
    value: void;
}

export function Frame(args: { markup: string, styles: string, marker: string }) {
    function frame(constructor: any) {
        function frameConstructor() {
            let constructedValue: any;
            if (constructor.prototype.constructor.constructorArgs) {
                const finalArgs = constructor
                    .prototype
                    .constructor
                    .constructorArgs
                    .sort((a: ConstructorArgs, b: ConstructorArgs) => a.prop > b.prop ? 1 : -1)
                    .map((value: ConstructorArgs) => value.value);
                constructedValue = new constructor(...finalArgs);
            } else {
                constructedValue = new constructor();
            }
            let previous = JSON.parse(JSON.stringify(constructedValue));
            let originalOnDestroy = constructedValue.onDestroy;
            let originalOnChanges = constructedValue.onChanges;

            constructedValue.onChanges = (changes: FrameChanges) => {
                if (originalOnChanges) {
                    originalOnChanges(changes);
                }
            }

            let interval = setInterval(() => {
                let changes: FrameChanges = {};
                let current = JSON.parse(JSON.stringify(constructedValue));
                Object.keys(current).forEach((key: string) => {
                    if (current[key] !== previous[key]) {
                        changes[key] = {
                            previous: previous[key],
                            current: current[key]
                        }
                    }
                });
                previous = current;
                if (Object.keys(changes).length > 0) {
                    constructedValue.onChanges(changes);
                }
            }, 100);

            constructedValue.onDestroy = () => {
                if (originalOnDestroy) {
                    originalOnDestroy();
                }
                clearInterval(interval);
            }
            return constructedValue;
        }
        getHtml(args.markup, (html: HTMLTemplateElement) => {
            getStyles(args.styles, html, (results: {css: string, html: HTMLTemplateElement}) => {
                const element = defineElement(args.marker, results.html, results.css); 
                Object.defineProperty(frameConstructor, 'content', { value: element })
            });
        });
        return <any>frameConstructor;
    }
    return frame;
}

export const isNumeric = (str: any) => {
    if (typeof str != "string") return false;
    return !isNaN(str as any) &&
           !isNaN(parseFloat(str));
}

export function Prop() {
    return function(target, propertyKey) { 
        let key = Symbol();
        const getter = function() {
            return this[key];
        };
        const setter = function(newVal: any) {
            let previous = this[key];
            if (newVal && isNumeric(newVal)) {
                this[key] = parseFloat(newVal);
            } else {
                this[key] = newVal;     
            }
            if (this.onChanges) {
                this.onChanges({
                    [propertyKey]: {
                        previous,
                        current: this[key]
                    }
                });
            }
        }; 
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true
        });
    }
}

@Frame({
    markup: './something.html',
    styles: './something.css',
    marker: 'some-component'
})
export class Component {
    constructor() {
        console.log(this);
    }
}

@Frame({
    markup: './another.html',
    styles: './another.css',
    marker: 'another-component'
})
export class Another {
    @Prop() someValue = 1;
}
