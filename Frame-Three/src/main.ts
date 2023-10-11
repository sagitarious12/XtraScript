/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { Capsule, Frame, Inject, Injectable, Prop } from "./decorators";
import { FrameChanges, OnChanges, OnDestroy, OnInit } from "./core/types";
import { Route, RouterCapsule, RouterService } from './core/router';
import { Contract, ContractTerms, State, StateService, Term } from "./core/state";



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

    testStateContract: TestState;

    constructor(
        @Inject(ComponentService) componentService: ComponentService,
        @Inject(RouterService) routerService: RouterService,
        @Inject(StateService) state: StateService
    ) {
        this.router = routerService;
        this.testStateContract = state.getContract(TestState) as TestState;
        setTimeout(() => {
            this.testStateContract.setTestValue('Some New Value From Test Term');
        }, 2000);
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
class ChildComponent implements OnDestroy {
    some_text: string = "Hello Child Component";
    router: RouterService;

    terms: ContractTerms<TestStateType>;
    testValue: string = "Default Test Value Value";

    constructor(
        @Inject(RouterService) routerService: RouterService,
        @Inject(StateService) state: StateService
    ) {
        this.router = routerService;
        this.terms = state.getContract(TestState)?.getTerms() as ContractTerms<TestStateType>;
        this.terms.onChanges((value: TestStateType) => {
            this.testValue = value.test;
        });
    }

    onDestroy = () => {
        this.terms.unsubscribe();
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

interface TestStateType {
    test: string;
}

class TestState extends Contract<TestStateType> {
    constructor() {
        super();
        this.terms = [{name: 'test', term: new Term('Some Value From Test Term')}];
    }

    setTestValue = (value: string) => {
        this.setTerm('test', value);
    }
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
        RouterCapsule.setRootRoutes(routes),
        State.setStates([TestState])
    ],
    Components: [
        Component,
        ChildComponent
    ],

})
class ComponentCapsule {}