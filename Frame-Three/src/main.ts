/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { getExpressions, parseExpressionConditional } from "./expression";
import { Prop } from "./prop-decorator";
import { BuiltinInterfaces, Constructor, FrameArgs, FrameChanges, OnChanges, OnDestroy, OnInit } from "./types";
import { getHtml, getStyles } from "./utils";

const isInputPropAttribute = (name: string) => name[0] === '[' && name[name.length - 1] === ']';
const stripBracketsFromAttribute = (name: string) => name.replace('[', '').replace(']', '');
const isHTMLExpression = (value: string) => value.includes('}}') && value.includes('}}');
const htmlTags = ["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","label","legend","li","link","main","map","mark","math","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rb","rp","rt","rtc","ruby","s","samp","script","search","section","select","slot","small","source","span","strong","style","sub","summary","sup","svg","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr"];
enum ChangableNodeTypes {CUSTOM,TEXT};
interface ChangableNode { type: ChangableNodeTypes, node: ChildNode };

const defineElement = (selector: string, html: HTMLTemplateElement, styles: string, component: Constructor<void>) => {
    class EL extends HTMLElement {

        component: BuiltinInterfaces<void>;
        changableNodes: ChangableNode[] = [];

        static attrs: string[] = [...(component.prototype['inputProps'] ? component.prototype['inputProps'] : [])];

        static get observedAttributes(): string[] {
            return this.attrs;
        }

        constructor() {
            super();
            this.attachShadow({mode: 'open'});
            const style: HTMLStyleElement = document.createElement('style');
            style.appendChild(document.createTextNode(styles));
            this.shadowRoot?.appendChild(style);
            this.shadowRoot?.appendChild(html.content.cloneNode(true));

            // handle injectables
            this.component = new component();
            this.setupComponentProxies();
            this.setChangableNodes();
            this.checkTheseAttributes(this.attributes);
        }

        setupComponentProxies = () => {
            const _this = this;
            
            const name = this.component.constructor.name;
            this.component = new Proxy(this.component, {
                get(target: any, p: string, receiver) {
                    const value = target[p];
                    if (value instanceof Function) {
                        return function (...args: any) {
                            return value.apply(this === receiver ? target : this, args);
                        }
                    }
                    return value;
                },
                set(target, p, newValue) {
                    target[p] = newValue;
                    _this.performChangeDetection(_this);
                    return true;
                }
            });
        }

        checkTheseAttributes = (attributes: NamedNodeMap, performChangeDetection: boolean = true) => {
            for (let i = 0; i < attributes.length; i++) {
                let attr: Attr = (attributes.item(i) as Attr);
                if (isInputPropAttribute(attr.name)) {

                    let strippedName = stripBracketsFromAttribute(attr.name);
                    let prev = (this.component as any)[strippedName];
                    if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
                        const result = parseExpressionConditional((this as any).parent, getExpressions(attr.nodeValue));
                        (this.component as any)[strippedName] = result;
                    } else {
                        (this.component as any)[strippedName] = attr.nodeValue;
                    }
                    if (this.component.onChanges) {
                        this.component.onChanges({
                            [strippedName]: {
                                current: attr.nodeValue,
                                previous: prev
                            }
                        } as FrameChanges);
                    }
                    if (performChangeDetection) {
                        this.performChangeDetection(this);
                    }
                    this.removeAttribute(attr.name);
                }
            }
        }

        connectedCallback() {
            if (this.component.onInit) {
                this.component.onInit();
            }
        }

        disconnectedCallback() {
            if (this.component.onDestroy) {
                this.component.onDestroy();
            }
        }

        attributeChangedCallback(attrName: string, oldVal: any, newValue: any) {
            if (attrName.includes('data-') && newValue !== null) {
                let attr = attrName.replace('data-', '');
                (this.component as any)[attr] = newValue;
                if (this.component.onChanges) {
                    this.component.onChanges({
                        [attr]: {
                            current: newValue,
                            previous: oldVal
                        }
                    } as FrameChanges);
                }
            }
            this.performChangeDetection(this);
            this.removeAttribute(attrName);
        }

        setChangableNodes = () => {
            const checkNode = (node: ChildNode) => {
                if (node.nodeName === 'STYLE') return;

                if (node.childNodes.length > 0) {
                    node.childNodes.forEach((child: ChildNode) => {
                        checkNode(child);
                    })
                }

                if (node.nodeName === '#text') {
                    if ((node.nodeValue as string).slice(1, (node.nodeValue as string).length).trim() === '') return;
                    if (node.nodeValue?.includes('{{') && node.nodeValue.includes('}}')) {
                        (node as any)["permanentValue"] = node.nodeValue;
                        this.changableNodes.push({ type: ChangableNodeTypes.TEXT, node });
                        return;
                    }
                }

                if ((node as any).localName && !htmlTags.includes((node as any).localName)) {
                    let attrs: Attr[] = [];
                    for (let i = 0; i < (node as HTMLElement).attributes.length; i++) {
                        attrs.push((node as HTMLElement).attributes.item(i) as Attr);
                    }
                    (node as any)["permanentAttributes"] = attrs;
                    (node as any)["parent"] = this.component;
                    this.changableNodes.push({ type: ChangableNodeTypes.CUSTOM, node });
                    return;
                }
            }
            this.shadowRoot?.childNodes.forEach((node: ChildNode) => {
                checkNode(node);
            })
        }

        performChangeDetection = (_this: any) => {
            _this.changableNodes.forEach((node: ChangableNode) => {
                if (node.type === ChangableNodeTypes.TEXT) {
                    const expressions = getExpressions((node.node as any)["permanentValue"]);
                    const expressionResult = parseExpressionConditional(_this.component, expressions);
                    node.node.nodeValue = expressionResult;
                    return;
                }

                if (node.type === ChangableNodeTypes.CUSTOM) { 
                    for (let i = 0; i < (node.node as any)['permanentAttributes'].length; i++) {
                        let attr: Attr = (node.node as any)['permanentAttributes'][i];
                        let strippedName = stripBracketsFromAttribute(attr.name);

                        // only need to update if it is an expression not static values
                        if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
                            const exprResult = parseExpressionConditional(_this.component, getExpressions(attr.nodeValue));
                            console.log(exprResult);
                            (node.node as HTMLElement).setAttribute(`data-${strippedName}`, exprResult);
                        }
                    }
                    return;
                }
            });
        }
    }
    customElements.define(selector, EL);
}

export function Frame(args: FrameArgs) {
    function ctor(constructor: any) {
        getHtml(args.markup, (html: HTMLTemplateElement) => {
            getStyles(args.styles, html, (results: {css: string, html: HTMLTemplateElement}) => {
                defineElement(args.marker, results.html, results.css, constructor); 
            });
        });
        return <any>constructor;
    }
    return ctor;
}

@Frame({
    marker: 'frame-component',
    markup: './frame/frame.html',
    styles: './frame/frame.css'
})
class Component {
    value: number = 1;
    @Prop() text: string = "Hello World";
    secondaryContent: string = "Here is the slot Content From Frame Component";

    constructor() {

        setTimeout(() => {
            // this is not using the proxy and therefore not updating the values on the DOM
            this.secondaryContent = "Here is some updated value";
        }, 2000);
    }
}

@Frame({
    marker: 'frame-child-component',
    markup: './frame-child/child.html',
    styles: './frame-child/child.css'
})
class ChildComponent implements OnChanges {
    @Prop() some_text: string = "Hello Child Component";

    onChanges(changes?: FrameChanges) {
    }
}