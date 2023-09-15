import { BunFile } from 'bun';
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Component, ElementData } from '../types/baseTypes';

const readModuleFile = (path): BunFile => {
    return Bun.file(import.meta.dir + path);
}

const parseHTML = async (htmlPath: string, cssPath: string, component: Component) => {
    const html = readModuleFile(htmlPath);
    // const css = readModuleFile(cssPath);
    const htmlText = await html.text();
    const tokenizer = new Tokenizer(htmlText);
    tokenizer.tokenize();

    const parser: Parser = new Parser(tokenizer.tokens, component);
    const elementData: ElementData[] = parser.parseTokens();

    console.log(elementData);
}


class TestComponent {

}
parseHTML('/index.html', '/styles.css', TestComponent as any);
