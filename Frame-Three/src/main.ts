/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { Capsule, Frame, Inject, Injectable, Prop } from "./decorators";
import { FrameChanges, OnChanges, OnDestroy, OnInit } from "./core/types";
import { Route, RouterCapsule, RouterService } from './core/router';



@Injectable()
class ComponentService {
    private value: string = "Hello From Component Service";

    getValue = (): string => {
        return this.value;
    }
}

@Frame({
    marker: 'frame-component',
    markup: './frame/frame.html',
    styles: './frame/frame.css'
})
class Component {

    router: RouterService;

    arr: any[] = [
        {obj: "Hello"}, 
    ];

    arr2: any[] = [1,2,3];

    arr3: any[] = ["hello", "world"];

    arr4: any[] = ["Slot Value 1", "Slot Value 2"];

    constructor(
        @Inject(ComponentService) componentService: ComponentService,
        @Inject(RouterService) routerService: RouterService
    ) {
        this.router = routerService;
        setTimeout(() => {
            this.arr = [...this.arr, {obj: componentService.getValue()}]
        }, 2000);
    }

    public child = () => {
        this.router.setRoute('/');
    }

    public childTwo = () => {
        this.router.setRoute('/child-two');
    }
}

@Frame({
    marker: 'frame-child-component',
    markup: './frame-child/child.html',
    styles: './frame-child/child.css'
})
class ChildComponent {
    some_text: string = "Hello Child Component";
    router: RouterService

    constructor(
        @Inject(RouterService) routerService: RouterService
    ) {
        this.router = routerService;
    }
}

@Frame({
    marker: 'frame-child-component-two',
    markup: './frame-child-two/child.html',
    styles: './frame-child-two/child.css'
})
class ChildComponentTwo {
    some_text: string = "Hello Child Component";
}

const routes: Route[] = [
    {
        component: ChildComponent, path: '/', title: 'Child Component', default: true
    },
    {
        component: ChildComponentTwo, path: '/child-two', title: 'Child Two Component'
    }
]

@Capsule({
    Capsules: [
        RouterCapsule.setRootRoutes(routes)
    ],
    Components: [
        Component,
        ChildComponent
    ],

})
class ComponentCapsule {}