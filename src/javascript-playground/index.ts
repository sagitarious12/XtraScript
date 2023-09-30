interface FrameChanges {
    [key: string]: {
        previous: any;
        current: any;
    }
}

function Frame() {
    function frame(constructor) {
        function frameConstructor(...args: any[]) {
            let constructedValue = new constructor(...args);
            let previous = JSON.parse(JSON.stringify(constructedValue));
            let originalOnDestroy = constructedValue.onDestroy;
            let originalOnChanges = constructedValue.onChanges;

            constructedValue.onChanges = (changes: FrameChanges) => {
                if (originalOnChanges) {
                    originalOnChanges(changes);
                }
            }

            let interval = setInterval(() => {
                let changes = {};
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

        
        Object.defineProperty(frameConstructor, 'name', {value: constructor.name, writable: false});
        return <any>frameConstructor;
    }
    return frame;
}

interface OnDestroy {
    onDestroy: () => void;
}

interface OnChanges {
    onChanges: ((changes: FrameChanges) => void) | (() => void);
}

function Prop() {
    return function(target, propertyKey) { 
        let key = Symbol();
        const getter = function() {
            return this[key];
        };
        const setter = function(newVal: any) {
            let previous = this[key];
            this[key] = newVal;     
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

function Emit() {
    return function(target, propertyKey) {
        let fn: Function;
        const emit = (...args: any[]) => {
            fn(args);
        }
        const getter = () => {
            return {
                emit
            };
        }
        const setter = (emitFn: Function) => {
            fn = emitFn;
        }
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter
        })
    }
}

interface EmitterValue {
    value: string;
    another: string;
}

interface Emitter<T = {}> {
    emit: ((args: T) => void) | (() => void);
}

interface Statement {
    key: string;
    value: string;
    isVariable?: boolean;
    isFunction?: boolean;
    isConditional?: boolean;
    isExpression?: boolean;
}

interface ElementData {
    selector: string;
    attributes: Statement[];
    children: ElementData[];
    content?: Statement;
    usedInComponent: ((...args: any[]) => void) | (() => void);
    usesComponent?: ((...args: any[]) => void) | (() => void);
    componentArgs: any[];
    styleContent?: string;
}

type isClass = HTMLElement;

interface ExpressionString {
    value: string;
    isExpression?: boolean;
}

enum TokenType {
    ident,
    add,
    sub,
    mult,
    div,
    open_paren,
    close_paren,
    comma,
    function
}

interface Token {
    type: TokenType;
    value?: string;
}

interface NodeLiteral {
    value: any;
}

interface NodeExecution {
    value: any;
    args: (NodeLiteral | NodeStatement | NodeExecution)[];
}

interface NodeExpression {
    value: any;
}

interface NodeStatement {
    value: NodeExecution | NodeLiteral | NodeStatement;
}

interface Program {
    stmts: NodeStatement[];
}

const htmlTagNames = ['a','abbr','acronym','address','applet','area','article','aside','audio','b','base','basefont','bdi','bdo','bgsound','big','blink','blockquote','body','br','button','canvas','caption','center','cite','code','col','colgroup','command','content','data','datalist','dd','del','details','dfn','dialog','dir','div','dl','dt','element','em','embed','fieldset','figcaption','figure','font','footer','form','frame','frameset','h1','h2','h3','h4','h5','h6','head','header','hgroup','hr','html','i','iframe','image','img','input','ins','isindex','kbd','keygen','label','legend','li','link','listing','main','map','mark','marquee','math','menu','menuitem','meta','meter','multicol','nav','nextid','nobr','noembed','noframes','noscript','object','ol','optgroup','option','output','p','param','picture','plaintext','pre','progress','q','rb','rbc','rp','rt','rtc','ruby','s','samp','script','search','section','select','shadow','slot','small','source','spacer','span','strike','strong','style','sub','summary','sup','svg','table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','tt','u','ul','var','video','wbr','xmp'];

const createWebPage = (data: ElementData[]) => {
    data.forEach((element: ElementData) => {
        let component = new element.usedInComponent(...element.componentArgs);
        document.body.appendChild(createElement(element, component, null));
    });
}

const createOnChanges = (component: any, el: HTMLElement, data: ElementData, parentComponent: any = null, continueIterating: boolean = true) => {
    let originalOnChanges = component.onChanges;
    component.onChanges = (changes: FrameChanges) => {
        
        if (Object.keys(changes).length > 0 ) {

            data.attributes.forEach((statement: Statement) => {
                if (statement.key.includes('(') && statement.key.includes(')')) {
                    if (parentComponent) {
                        const value = statement.key.replace('(', '').replace(')', '');
                        const protoKeys = Object.keys(Object.getPrototypeOf(parentComponent));
                        const mainKeys = Object.keys(parentComponent);
                        const allKeys = [...protoKeys, ...mainKeys];
                        if (allKeys.includes(value)) {
                            parentComponent[value] = getComponentValue(component, statement);
                        }
                    }
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
        }
        
        if (originalOnChanges) {
            originalOnChanges(changes);
        }
    }

    if (parentComponent && continueIterating) {
        createOnChanges(parentComponent, el, data, component, false);
    }
}

const getExpressions = (value: string): ExpressionString[] => {
    const split = value.split("{{");
    const expressions: ExpressionString[] = [
        {
            value: split[0]
        }
    ];
    for(let i = 1; i < split.length; i++) {
        const splitAgain = split[i].split("}}");
        expressions.push(
            {
                value: splitAgain[0],
                isExpression: true
            },
            {
                value: splitAgain[1]
            }
        );
    }
    return expressions
}

const parseExpressionConditional = (component: isClass, expression: ExpressionString): string => {
    let tokens: Token[] = [];
    let chars = expression.value.split("");
    for (let i = 0; i < chars.length; i++) {
        let temp = "";
        if (chars[i].match(/[a-z]/i)) {
            while(chars[i].match(/[a-z]/i) || chars[i].match(/[0-9]/i)) {
                temp += chars[i];
                if (i + 1 == chars.length || !(chars[i + 1].match(/[a-z]/i) || chars[i + 1].match(/[0-9]/i))) {
                    break;
                }
                i++;
            }
            tokens.push({type: TokenType.ident, value: temp});
            continue;
        } else if (chars[i] === '"') {
            temp += '"';
            i++;
            while(chars[i]) {
                temp += chars[i];
                if (chars[i + 1] === '"') {
                    temp += '"';
                    break;
                } else if (i + 1 == chars.length) {
                    break;
                }
                i++;
            }
            tokens.push({type: TokenType.ident, value: temp});
            continue;
        } else if (chars[i].match(/[0-9]/i)) {
            while(chars[i].match(/[0-9]/i)) {
                temp += chars[i];
                if (i + 1 == chars.length || !(chars[i + 1].match(/[0-9]/i))) {
                    break;
                }
                i++;
            }
            tokens.push({type: TokenType.ident, value: temp});
            continue;
        } else if (chars[i] === '+') {
            tokens.push({type: TokenType.add});
            continue;
        } else if (chars[i] === '-') {
            tokens.push({type: TokenType.sub});
            continue;
        } else if (chars[i] === '*') {
            tokens.push({type: TokenType.mult});
            continue;
        } else if (chars[i] === '/') {
            tokens.push({type: TokenType.div});
            continue;
        } else if (chars[i] === '(') {
            tokens.push({type: TokenType.open_paren});
            continue;
        } else if (chars[i] === ')') {
            tokens.push({type: TokenType.close_paren});
            continue;} else if (chars[i] === ',') {
            tokens.push({type: TokenType.comma});
            continue;
        } else {
            continue;
        }
    };

    let i = 0;
    const parseStatement = (tokens: Token[]) => {

        let runningValue: any = '';

        if (tokens[i].type === TokenType.ident && i + 1 < tokens.length && tokens[i + 1].type === TokenType.open_paren) {
            const currentToken = tokens[i];
            const parseArgs: any = [];
            i++; // function name
            i++; // open paren
            const parseArg = (): string | number | boolean | undefined => {
                if (tokens[i].type === TokenType.ident) {
                    const value = tokens[i].value;
                    if (tokens[i + 1].type === TokenType.comma) {
                        i++;
                    }
                    // TODO need to check if the arg is a function call
                    if ((value as string )[0]=== '"') {
                        return value;
                    } else if ((value as string)[0].match(/[0-9]/i)) {
                        return value;
                    } else {
                        return component[value as string];
                    }
                }
                return undefined;
            }
            let continueGoing: boolean = true;
            while(continueGoing) {
                let result = parseArg();
                if (!result) {
                    continueGoing = false;
                    continue;
                };
                // consume the function / variable name;
                i++;
                parseArgs.push(result);
            }

            // consume the close paren
            i++;

            runningValue = component[currentToken.value as string](...parseArgs);
        } else {
            // consume variable name;
            if (tokens[i].value && (tokens[i].value as string)[0]=== '"') {
                runningValue = tokens[i].value;
            } else if ((tokens[i].value as string)[0].match(/[0-9]/i)) {
                runningValue = parseInt(tokens[i].value as string);
            } else {
                runningValue = component[tokens[i].value as string];
            }
            i++;
        }

        if (i < tokens.length) {
            if (tokens[i].type === TokenType.add) {
                i++;
                return runningValue + parseStatement(tokens);
            }
            else if (tokens[i].type === TokenType.sub) {
                i++;
                return runningValue - parseStatement(tokens);
            }
            else if (tokens[i].type === TokenType.mult) {
                i++;
                return runningValue * parseStatement(tokens);
            }
            else if (tokens[i].type === TokenType.div) {
                i++;
                return runningValue / parseStatement(tokens);
            }
        } else {
            return runningValue;
        }
    }
    
    const result = parseStatement(tokens);

    return result;
}

const getComponentValue = (component: isClass, statement: Statement): string => {
    let attributeValue: string = "";
    const isNumeric = (str: any) => {
        if (typeof str != "string") return false;
        return !isNaN(str as any) &&
               !isNaN(parseFloat(str));
      }
    if (statement.isFunction) {
        let value = component[statement.value]();
        if (isNumeric(value)) {
            attributeValue = parseFloat(value) as any;
        } else {
            attributeValue = value;
        }
    } else if (statement.isVariable) {
        let value = component[statement.value];
        if (isNumeric(value)) {
            attributeValue = parseFloat(value) as any;
        } else {
            attributeValue = component[statement.value];
        }
    } else if (statement.isConditional) {
        const expressions = getExpressions(statement.value);
        expressions.forEach((expr: ExpressionString) => {
            if (expr.isExpression) {
                let value = parseExpressionConditional(component, expr);
                if (isNumeric(value)) {
                    attributeValue += parseFloat(value);
                } else {
                    attributeValue += value;
                }
            } else {
                attributeValue += expr.value;
            }
        })
    } else if (statement.isExpression) {
        const expressions = getExpressions(statement.value);
        expressions.forEach((expr: ExpressionString) => {
            if (expr.isExpression) {
                let value = parseExpressionConditional(component, expr);
                if (isNumeric(value)) {
                    attributeValue += parseFloat(value);
                } else {
                    attributeValue += value;
                }
            } else {
                attributeValue += expr.value;
            }
        })
    } else {
        attributeValue = statement.value;
    }
    return attributeValue;
}

const createElement = (data: ElementData, component: isClass, shadow: ShadowRoot | null = null, parentComponent: isClass | null = null): HTMLElement => {

    const el = document.createElement(data.selector);

    let shadowRoot;
    if (shadow === null) {
        shadowRoot = el.attachShadow({ mode: 'open'});
    } else {
        shadowRoot = shadow;
    }
    
    if (data.styleContent) {
        const style = document.createElement('style');
        style.textContent = data.styleContent;
        shadowRoot.appendChild(style);
    }

    data.attributes.forEach((statement: Statement) => {
        if (statement.key.includes('(') && statement.key.includes(')')) {
            if (parentComponent) {
                const value = statement.key.replace('(', '').replace(')', '');
                component[value] = getComponentValue(parentComponent, statement);;
            } else {
            }
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
        let childComponent: isClass;
        if (!isChildComponentSame(child) && child.usesComponent) {
            childComponent = new (child.usesComponent as any)(...data.componentArgs);
        } else {
            childComponent = {} as HTMLElement; // should not matter, this should never be used.
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

@Frame()
class Component implements OnChanges {
    displayValue: number = 1;
    addedNumber: number = 4;

    constructor() {
        setTimeout(() => {
            this.displayValue = 10;
        }, 5000);
    }

    getDisplayValue = () => {
        return this.displayValue;
    }

    getSomeText = () => {
        return "From A Whole New World";
    }

    onChanges = (changes: FrameChanges) => {
        console.log("Component Changes", changes);
    }
}

@Frame()
class SubComponent implements OnChanges {
    @Prop() 
    parentValue: number;

    somethingElse: string = "Hello World";

    onChanges = (changes: FrameChanges) => {
        console.log("SubComponent Changes", changes);
    }
}

const data: ElementData[] = [
    {
        attributes: [
            {
                key: 'data-value',
                value: 'displayValue',
                isVariable: true
            }
        ],
        children: [
            {
                attributes: [
                    {
                        key: 'class',
                        value: 'awesome-class'
                    }
                ],
                children: [
                    {
                        attributes: [
                            {
                                key: 'class',
                                value: 'sub-awesome-class'
                            }
                        ],
                        children: [],
                        usedInComponent: Component as any,
                        componentArgs: [],
                        selector: 'div',
                        content: {
                            value: 'Hello {{getDisplayValue() + addedNumber}} {{getSomeText()}}',
                            key: '',
                            isExpression: true
                        }
                    },
                    {
                        attributes: [
                            {
                                key: '(parentValue)',
                                value: '{{displayValue}}',
                                isExpression: true
                            }
                        ],
                        children: [
                            {
                                attributes: [
                                    {
                                        key: 'class',
                                        value: 'sub-component-class'
                                    }
                                ],
                                children: [],
                                usedInComponent: SubComponent as any,
                                componentArgs: [],
                                selector: 'span',
                                content: {
                                    value: 'Parent Component Value: {{parentValue}}',
                                    key: '',
                                    isExpression: true
                                }
                            }
                        ],
                        usedInComponent: Component as any,
                        usesComponent: SubComponent as any,
                        componentArgs: [],
                        selector: 'my-sub-component',
                        content: {
                            value: '',
                            key: ''
                        },
                        styleContent: `
.sub-component-class {
    width: 100%;
    min-height: 150px;
    background: green;
    font-size: 32px;
    color: dark-green;
}
                        `
                    }
                ],
                usedInComponent: Component as any,
                componentArgs: [],
                selector: 'div',
                content: {
                    value: '',
                    key: ''
                }
            }
        ],
        usedInComponent: Component as any,
        usesComponent: Component as any,
        content: {
            value: '',
            key: ''
        },
        selector: 'my-component',
        componentArgs: [],
        styleContent: `
.awesome-class {
    height: 200px;
    font-size: 25px;
    display: flex;
    flex-direction: column;
}

.sub-awesome-class {
    color: blue;
    letter-spacing: 3px;
    width: 100%;
}
        `
    }
];

createWebPage(data);