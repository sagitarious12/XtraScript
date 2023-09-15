// function Emit() {
//     return function(target, propertyKey) {
//         let fn: Function;
//         const emit = (...args: any[]) => {
//             fn(args);
//         }
//         const getter = () => {
//             return {
//                 emit
//             };
//         }
//         const setter = (emitFn: Function) => {
//             fn = emitFn;
//         }
//         Object.defineProperty(target, propertyKey, {
//             get: getter,
//             set: setter
//         })
//     }
// }
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function Frame() {
    function frame(constructor) {
        function frameContructor(...args) {
            let constructedValue = new constructor(...args);
            let previous = JSON.parse(JSON.stringify(constructedValue));
            let originalOnDestroy = constructedValue.onDestroy;
            let originalOnChanges = constructedValue.onChanges;
            constructedValue.onChanges = (changes) => {
                if (originalOnChanges) {
                    originalOnChanges(changes);
                }
                // handle send changes to the listeners for the html
            };
            let interval = setInterval(() => {
                console.log("Checking Changes");
                let changes = {};
                let current = JSON.parse(JSON.stringify(constructedValue));
                Object.keys(current).forEach((key) => {
                    if (current[key] !== previous[key]) {
                        changes[key] = {
                            previous: previous[key],
                            current: current[key]
                        };
                    }
                });
                if (Object.keys(changes).length > 0) {
                    constructedValue.onChanges(changes);
                }
                previous = current;
            }, 100);
            constructedValue.onDestroy = () => {
                if (originalOnDestroy) {
                    originalOnDestroy();
                }
                clearInterval(interval);
            };
            return constructedValue;
        }
        return frameContructor;
    }
    return frame;
}
let Test = class Test {
    constructor(member) {
        this.setMember = (value) => {
            this.member = value;
        };
        this.onDestroy = () => {
            console.log("Destroying");
        };
        this.onChanges = (changes) => {
            console.log(changes);
        };
        this.member = member;
    }
};
Test = __decorate([
    Frame()
], Test);
const test = new Test(1);
setTimeout(() => {
    test.setMember(10);
    setTimeout(() => {
        test.onDestroy();
    }, 200);
}, 200);
