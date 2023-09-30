/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// import { createWebPage } from "./core/createWebPage";
// import { Emit, Emitter } from "./decorators/emit";
// import { Frame } from "./decorators/frame";
// import { Prop } from "./decorators/prop";
// import { ElementData } from "./types/baseTypes";

import { createWebPage } from './core/createWebPage';
import { Route, RouterCapsule, RouterService } from './core/router';
import { Capsule } from './decorators/capsule';
import { Frame } from './decorators/frame';
import { Inject, Injectable } from './decorators/injectable';
import { OnDestroy } from './types/baseTypes';



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
            usedInComponent: SuperCoolTwo,
            content: {
                key: '', value: 'Hello from {{value}}', isExpression: true
            }
        }
    ],
    marker: 'FrameSuperCoolTwo'
})
class SuperCoolTwo {
    value = 'Super Cool 2 Component';
}

@Frame({
    styles: `
.something {
    width: 300px;
    height: 300px;
    background: blue;
    color: white;
}
    `,
    markup: [
        {
            attributes: [{key: 'class', value: 'something'}],
            children: [
                {
                    attributes: [
                        {
                            key: "$click",
                            value: "goToSuperCoolOne",
                            isFunction: true
                        }
                    ],
                    children: [],
                    selector: 'button',
                    usedInComponent: Another,
                    content: { key: '', value: 'Super Cool 1'}
                },
                {
                    attributes: [
                        {
                            key: "$click",
                            value: "goToSuperCoolTwo",
                            isFunction: true
                        }
                    ],
                    children: [],
                    selector: 'button',
                    usedInComponent: Another,
                    content: { key: '', value: 'Super Cool 2'}
                },
                {
                    attributes: [],
                    children: [],
                    selector: 'router-feed',
                    usedInComponent: Another,
                    content: {key: '', value: ''},
                }
            ],
            selector: 'div',
            usedInComponent: Another,
            content: {
                key: '', value: ''
            }
        }
    ],
    marker: 'FrameAnother'
})
class Another {
    value: string;
    router: RouterService;
    constructor(
        @Inject(Something) something: Something,
        @Inject(RouterService) router: RouterService
    ) {
        this.value = something.getWorld();
        this.router = router;
    }

    goToSuperCoolOne = () => {
        this.router.setRoute('/');
    }

    goToSuperCoolTwo = () => {
        this.router.setRoute('/super-cool-two')
    }
}

const routes: Route[] = [
    {
        path: '/', component: SuperCool, title: 'Another Component', default: true
    },
    {
        path: '/super-cool-two', component: SuperCoolTwo, title: 'Something Component'
    }
]

@Capsule({
    Capsules: [
        RouterCapsule.setRootRoutes(routes)
    ],
    Components: [
        Another
    ],
    Exports: [],
    Init: Another
})
class MainCapsule {}

createWebPage(MainCapsule);