/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// import { createWebPage } from "./core/createWebPage";
// import { Emit, Emitter } from "./decorators/emit";
// import { Frame } from "./decorators/frame";
// import { Prop } from "./decorators/prop";
// import { ElementData } from "./types/baseTypes";

import { createWebPage } from './core/createWebPage';
import * as Dep from './core/dependency-injector';
import { Capsule } from './decorators/capsule';
import { Frame } from './decorators/frame';
import { Inject, Injectable } from './decorators/injectable';
import { Component } from './types/baseTypes';

// Needs to be the first thing that occurs in the build of Frame.
const depinj = new Dep.DependencyInjector();
(window as any).dependencies = depinj;


@Injectable()
class Something {
    private value: string = 'World!';

    getWorld = (): string => {
        return this.value;
    }
}

@Frame({
    styles: `
.super-cool {
    width: 75px;
    background: pink;
    color: black;
}
    `,
    markup: [
        {
            attributes: [{key: 'class', value: 'super-cool'}],
            children: [],
            selector: 'div',
            usedInComponent: SuperCool,
            content: {
                key: '', value: 'Hello from {{value}}', isExpression: true
            }
        }
    ],
    marker: 'FrameSuperCool'
})
class SuperCool {
    value = 'Super Cool Component';
    constructor(@Inject(Something) something: Something) {
        console.log(something.getWorld());
    }
}

@Frame({
    styles: `
.something {
    width: 100px;
    height: 100px;
    background: blue;
    color: white;
}
    `,
    markup: [
        {
            attributes: [{key: 'class', value: 'something'}],
            children: [
                {
                    attributes: [],
                    children: [],
                    selector: 'FrameSuperCool',
                    usedInComponent: Another,
                    content: {key: '', value: ''},
                    usesComponent: SuperCool
                }
            ],
            selector: 'div',
            usedInComponent: Another,
            content: {
                key: '', value: 'Hello {{value}}', isExpression: true
            }
        }
    ],
    marker: 'FrameAnother'
})
class Another {
    value: string;
    constructor(@Inject(Something) something: Something) {
        this.value = something.getWorld();
        console.log(this.value);
    }
}

@Capsule({
    Capsules: [],
    Components: [
        Another
    ],
    Exports: [],
    Init: Another
})
class MainCapsule {}

createWebPage(MainCapsule);

// @Frame()
// class Component {
//     displayValue: number = 1;
//     addedNumber: number = 4;

//     constructor() {}

//     getDisplayValue = () => {
//         return this.displayValue;
//     }

//     updateDisplayValue = (value: number) => {
//         this.displayValue = value;
//     }

//     getSomeText = () => {
//         return "From A Whole New World";
//     }
// }

// @Frame()
// class SubComponent {
//     @Prop() 
//     parentValue: number;

//     @Emit()
//     emitter: Emitter<number>;

//     somethingElse: string = "Hello World";

//     updateDisplayValue = () => {
//         this.emitter.emit(this.parentValue + 1);
//     }
// }

// const data = [
//     {
//         attributes: [
//             {
//                 key: 'data-value',
//                 value: 'displayValue',
//                 isVariable: true
//             }
//         ],
//         children: [
//             {
//                 attributes: [
//                     {
//                         key: 'class',
//                         value: 'awesome-class'
//                     }
//                 ],
//                 children: [
//                     {
//                         attributes: [
//                             {
//                                 key: 'class',
//                                 value: 'sub-awesome-class'
//                             }
//                         ],
//                         children: [],
//                         usedInComponent: Component as any,
//                         componentArgs: [],
//                         selector: 'div',
//                         content: {
//                             value: 'Hello {{getDisplayValue() + addedNumber}} {{getSomeText()}}',
//                             key: '',
//                             isExpression: true
//                         }
//                     },
//                     {
//                         attributes: [
//                             {
//                                 key: '[parentValue]',
//                                 value: '{{displayValue}}',
//                                 isExpression: true
//                             },
//                             {
//                                 key: '(emitter)',
//                                 value: 'updateDisplayValue'
//                             }
//                         ],
//                         children: [
//                             {
//                                 attributes: [
//                                     {
//                                         key: 'class',
//                                         value: 'sub-component-class'
//                                     }
//                                 ],
//                                 children: [],
//                                 usedInComponent: SubComponent as any,
//                                 componentArgs: [],
//                                 selector: 'div',
//                                 content: {
//                                     value: 'Parent Component Value: {{parentValue}}',
//                                     key: '',
//                                     isExpression: true
//                                 }
//                             },
//                             {
//                                 attributes: [
//                                     {
//                                         key: 'class',
//                                         value: 'sub-component-button'
//                                     },
//                                     {
//                                         key: '$click',
//                                         value: 'updateDisplayValue'
//                                     }
//                                 ],
//                                 children: [],
//                                 usedInComponent: SubComponent as any,
//                                 componentArgs: [],
//                                 selector: 'button',
//                                 content: {
//                                     value: 'Click Me!',
//                                     key: '',
//                                     isExpression: true
//                                 }
//                             }
//                         ],
//                         usedInComponent: Component as any,
//                         usesComponent: SubComponent as any,
//                         componentArgs: [],
//                         selector: 'my-sub-component',
//                         content: {
//                             value: '',
//                             key: ''
//                         },
//                         styleContent: `
// .sub-component-class {
//     width: 100%;
//     min-height: 150px;
//     background: green;
//     font-size: 32px;
//     color: dark-green;
// }
//                         `
//                     }
//                 ],
//                 usedInComponent: Component as any,
//                 componentArgs: [],
//                 selector: 'div',
//                 content: {
//                     value: '',
//                     key: ''
//                 }
//             }
//         ],
//         usedInComponent: Component as any,
//         usesComponent: Component as any,
//         content: {
//             value: '',
//             key: ''
//         },
//         selector: 'my-component',
//         componentArgs: [],
//         styleContent: `
// .awesome-class {
//     height: 200px;
//     font-size: 25px;
//     display: flex;
//     flex-direction: column;
// }

// .sub-awesome-class {
//     color: blue;
//     letter-spacing: 3px;
//     width: 100%;
//     display: flex;
//     flex-direction: column;
// }
//         `
//     }
// ];