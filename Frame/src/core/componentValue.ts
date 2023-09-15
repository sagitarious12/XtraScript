import { isClass, Statement, ExpressionString } from "../types/baseTypes";
import { getExpressions, parseExpressionConditional } from "./expression";

export const isNumeric = (str: any) => {
    if (typeof str != "string") return false;
    return !isNaN(str as any) &&
           !isNaN(parseFloat(str));
}

export const getComponentValue = (component: isClass, statement: Statement): string => {
    let attributeValue: string = "";
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