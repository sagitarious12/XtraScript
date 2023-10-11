import { getHtml, getStyles } from "../core/utils";
import { FrameArgs } from "../core/types";
import { defineElement } from "../core/element";

export function Frame(args: FrameArgs) {
    function ctor(constructor: any) {
        getHtml(args.markup, (html: HTMLTemplateElement) => {
            getStyles(args.styles, html, (results: {css: string, html: HTMLTemplateElement}) => {
                defineElement(args.marker, results.html, results.css, constructor); 
            });
        });
        Object.defineProperty(constructor, 'selector', { value: args.marker, writable: false });
        return <any>constructor;
    }
    return ctor;
}