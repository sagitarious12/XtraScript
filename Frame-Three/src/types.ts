

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

type OnInitFunction = ((changes?: FrameChanges) => void) | (() => void);
type OnChangesFunction = ((changes?: FrameChanges) => void) | (() => void);
type OnDestroyFunction = () => void;

export interface OnDestroy {
    onDestroy: OnDestroyFunction;
}

export interface OnChanges {
    onChanges: OnChangesFunction;
}

export interface OnInit {
    onInit: OnInitFunction;
}

export type BuiltinInterfaces<T> = T & {
    onInit?: OnInitFunction, 
    onChanges?: OnChangesFunction, 
    onDestroy?: OnDestroyFunction
};

export type Constructor<T> = (new (...args: any[]) => BuiltinInterfaces<T>) | (new () => BuiltinInterfaces<T>);

export interface ExpressionString {
    value: string;
    isExpression?: boolean;
}

export enum TokenType {
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

export interface Token {
    type: TokenType;
    value?: string;
}

export interface NodeLiteral {
    value: any;
}

export interface NodeExecution {
    value: any;
    args: (NodeLiteral | NodeStatement | NodeExecution)[];
}

export interface NodeExpression {
    value: any;
}

export interface NodeStatement {
    value: NodeExecution | NodeLiteral | NodeStatement;
}

export interface Program {
    stmts: NodeStatement[];
}