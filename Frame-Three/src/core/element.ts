import { parseExpressionConditional, getExpressions, shouldChangeTextNode, shouldChangeCustomNode, shouldChangeForNode } from ".";
import { BuiltinInterfaces, Constructor, ConstructorArgs, FrameChanges } from "./types";




export const isInputPropAttribute = (name: string) => name[0] === '[' && name[name.length - 1] === ']';
export const stripBracketsFromAttribute = (name: string) => name.replace('[', '').replace(']', '');
export const isHTMLExpression = (value: string) => value.includes('}}') && value.includes('}}');
export const htmlTags = ["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","label","legend","li","link","main","map","mark","math","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rb","rp","rt","rtc","ruby","s","samp","script","search","section","select","slot","small","source","span","strong","style","sub","summary","sup","svg","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr"];
export const eventNames = ["abort", "afterprint", "animationend", "animationiteration", "animationstart", "beforeprint", "beforeunload", "blur", "canplay", "canplaythrough", "change", "click", "contextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "ended", "error", "focus", "focusin", "focusout", "fullscreenchange", "fullscreenerror", "hashchange", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "message", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "offline", "open", "pagehide", "pageshow", "paste", "pause", "play", "playing", "popstate", "progress", "ratechange", "resize", "reset", "scroll", "search", "seeked", "seeking", "select", "show", "stalled", "storage", "submit", "suspend", "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitionend", "unload", "volumechange", "waiting", "wheel"];
export enum ChangableNodeTypes {CUSTOM,TEXT,FOR};
export interface ChangableNode { type: ChangableNodeTypes, node: ChildNode, loopNode?: HTMLTemplateElement };


export const defineElement = (selector: string, html: HTMLTemplateElement, styles: string, component: Constructor<any>) => {
    class EL extends HTMLElement {

        component: BuiltinInterfaces<any>;
        changableNodes: ChangableNode[] = [];

        hasRunChangeDetection: boolean = false;

        eventListeners: any[] = [];

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

            this.initializeComponent();
            this.setupComponentProxies();
            this.setChangableNodes();
            this.checkTheseAttributes(this.attributes);
            if (!this.hasRunChangeDetection) {
                this.performChangeDetection(this);
            }
        }

        initializeComponent = () => {
            // handle injectables
            let finalArgs = [];
            if (component.prototype.constructor.constructorArgs) {
                finalArgs = component
                    .prototype
                    .constructor
                    .constructorArgs
                    .sort((a: ConstructorArgs, b: ConstructorArgs) => a.prop > b.prop ? 1 : -1)
                    .map((value: ConstructorArgs) => value.value);
            }

            this.component = new component(...finalArgs);
        }

        setupComponentProxies = () => {
            Object.keys(this.component).forEach((key: string) => {
                this.setupProxyForKey(key);
            });

            Object.keys(component.prototype).forEach((key: string) => {
                this.setupProxyForKey(key);
            });
        }

        checkTheseAttributes = (attributes: NamedNodeMap, performChangeDetection: boolean = true) => {
            for (let i = 0; i < attributes.length; i++) {
                let attr: Attr = (attributes.item(i) as Attr);
                if (isInputPropAttribute(attr.name)) {

                    let strippedName = stripBracketsFromAttribute(attr.name);
                    let prev = (this.component as any)[strippedName];
                    let current;
                    if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
                        const result = parseExpressionConditional((this as any).parent, getExpressions(attr.nodeValue));
                        current = result;
                        (this.component as any)[strippedName] = result;
                    } else {
                        current = attr.nodeValue;
                        (this.component as any)[strippedName] = attr.nodeValue;
                    }
                    if (this.component.onChanges) {
                        this.component.onChanges({
                            [strippedName]: {
                                current: current,
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
            this.eventListeners.forEach((ev) => {
                ev.node.removeEventListener(ev.eventName, ev.eventFn);
            });
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
                if (node.nodeName === "#comment") return;

                if ((node as HTMLElement).attributes) {
                    let attrs = (node as HTMLElement).attributes;
                    for (let i = 0; i < attrs.length; i++) {
                        let attr = attrs.item(i) as Attr;
                        if (attr.name.includes('$')) {
                            let eventName = attr.name.replace('$', '');
                            if (eventNames.includes(eventName)) {
                                let fnName = attr.nodeValue;
                                if (fnName && this.component[fnName]) {
                                    const eventFn = () => {
                                        this.component[(fnName as string)]();
                                    }
                                    node.addEventListener(eventName, eventFn);
                                    this.eventListeners.push({eventName, eventFn, node});
                                } else {
                                    console.error(`Invalid ${eventName} event listener: function "${fnName}" does not exist on type ${this.component.constructor.name}`);
                                }
                            } else {
                                console.error(`Invalid event name: ${eventName}. See https://www.w3schools.com/jsref/dom_obj_event.asp for accepted values.`);
                            }
                        }
                    }
                }

                if (node.childNodes.length > 0) {
                    node.childNodes.forEach((child: ChildNode) => {
                        if ((child as any).dataset && (child as any).dataset.for) {
                            const loopNode: HTMLElement = child.cloneNode(true) as HTMLElement;
                            const template: HTMLTemplateElement = document.createElement('template');
                            template.content.append(loopNode);
                            while(node.firstChild) {
                                node.removeChild(node.firstChild);
                            }
                            this.changableNodes.push({ type: ChangableNodeTypes.FOR, node, loopNode: template });
                            return;
                        }

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
            if (!this.hasRunChangeDetection) {
                this.hasRunChangeDetection = true;
            }
            _this.changableNodes.forEach((node: ChangableNode) => {
                if (node.type === ChangableNodeTypes.TEXT && shouldChangeTextNode(node)) {
                    const expressions = getExpressions((node.node as any)["permanentValue"]);
                    const expressionResult = parseExpressionConditional(_this.component, expressions);
                    node.node.nodeValue = expressionResult;
                    return;
                }

                if (node.type === ChangableNodeTypes.CUSTOM && shouldChangeCustomNode(node)) { 
                    for (let i = 0; i < (node.node as any)['permanentAttributes'].length; i++) {
                        let attr: Attr = (node.node as any)['permanentAttributes'][i];
                        let strippedName = stripBracketsFromAttribute(attr.name);

                        // only need to update if it is an expression not static values
                        if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
                            const expressions = getExpressions(attr.nodeValue);
                            const exprResult = parseExpressionConditional(_this.component, expressions);
                            (node.node as HTMLElement).setAttribute(`data-${strippedName}`, exprResult);
                        }
                    }
                    return;
                }

                if (node.type === ChangableNodeTypes.FOR && shouldChangeForNode(node)) {
                    while(node.node.firstChild) {
                        node.node.removeChild(node.node.firstChild);
                    }
                    
                    let forExpr = ((node.loopNode as HTMLTemplateElement).content.firstChild as HTMLElement).dataset.for;
                    if (typeof forExpr === 'string') {
                        const exprs = getExpressions(forExpr);
                        const exprResult = JSON.parse(parseExpressionConditional(this.component, exprs));
                        exprResult.forEach((v: any, i: number) => {
                            const newNode = (node.loopNode as HTMLTemplateElement).content.cloneNode(true);
                            node.node.appendChild(newNode);
                        });

                        const setExpressions = (setNode: ChildNode, indexMap: {[key: string]: number }) => {
                            if (setNode.nodeName === 'STYLE') return;

                            if (setNode.childNodes.length > 0) {
                                setNode.childNodes.forEach((child: ChildNode) => {
                                    setExpressions(child, indexMap);
                                })
                            }
            
                            if (setNode.nodeName === '#text') {
                                const expressions = getExpressions((setNode as any).nodeValue);
                                const expressionResult = parseExpressionConditional(_this.component, expressions, indexMap);
                                // console.log(expressionResult);
                                setNode.nodeValue = expressionResult;
                            }
            
                            if ((setNode as any).localName && !htmlTags.includes((setNode as any).localName)) {
                                for (let i = 0; i < (node.node as any).attributes.length; i++) {
                                    let attr: Attr = (node.node as any).attributes[i];
                                    let strippedName = stripBracketsFromAttribute(attr.name);
            
                                    // only need to update if it is an expression not static values
                                    if (attr.nodeValue && isHTMLExpression(attr.nodeValue)) {
                                        const expressions = getExpressions(attr.nodeValue);
                                        const exprResult = parseExpressionConditional(_this.component, expressions, indexMap);
                                        (node.node as HTMLElement).setAttribute(`data-${strippedName}`, exprResult);
                                    }
                                }
                                return;
                            }
                        }

                        node.node.childNodes.forEach((child: ChildNode, index: number) => {
                            let indexMap: any = {};
                            indexMap[`${(node.node.firstChild as HTMLElement).dataset.index}`] = index;
                            setExpressions(child, indexMap);
                        })

                    } else {
                        console.error("For Loop Invalid", forExpr);
                    }
                }
            });
        }

        setupProxyForKey = (key: string) => {
            let k = Symbol();
            let currentValue = this.component[key];
            const getter = () => {
                return this.component[k] || currentValue;
            };
            const setter = (newVal: any) => {
                this.component[k] = newVal;
                this.performChangeDetection(this);  
            }; 
            Object.defineProperty(this.component, key, {
                get: getter,
                set: setter,
                enumerable: true
            });
        }
    }
    customElements.define(selector, EL);
}