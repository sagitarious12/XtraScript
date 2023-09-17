import { FrameChanges } from "../decorators/frame";

export interface OnDestroy {
    onDestroy: () => void;
}

export interface OnChanges {
    onChanges: ((changes: FrameChanges) => void) | (() => void);
}

export interface Statement {
    key: string;
    value: string;
    isVariable?: boolean;
    isFunction?: boolean;
    isConditional?: boolean;
    isExpression?: boolean;
}

export type Component = (new (...args: any[]) => void) | (new () => void);

export interface ElementData {
    selector: string;
    attributes: Statement[];
    children: ElementData[];
    content?: Statement;
    usedInComponent: Component;
    usesComponent?: Component;
}

export type isClass = HTMLElement;

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