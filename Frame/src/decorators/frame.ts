import { ElementData } from "../types/baseTypes";

export interface FrameChanges {
    [key: string]: {
        previous: any;
        current: any;
    }
}

// export interface FrameArgs {
//     styles: string;
//     markup: ElementData[];
//     marker: string;
// }

export interface ConstructorArgs {
    prop: number; 
    value: void;
}

export function Frame(/*frameArgs: FrameArgs*/) {
    function frame(constructor) {
        function frameConstructor(args) {
            const finalArgs = constructor
                .prototype
                .constructor
                .constructorArgs
                .sort((a: ConstructorArgs, b: ConstructorArgs) => a.prop > b.prop ? 1 : -1)
                .map((value: ConstructorArgs) => value.value);
            let constructedValue = new constructor(...finalArgs);
            let previous = JSON.parse(JSON.stringify(constructedValue));
            let originalOnDestroy = constructedValue.onDestroy;
            let originalOnChanges = constructedValue.onChanges;

            constructedValue.onChanges = (changes: FrameChanges) => {
                if (originalOnChanges) {
                    originalOnChanges(changes);
                }
            }

            let interval = setInterval(() => {
                let changes = {};
                let current = JSON.parse(JSON.stringify(constructedValue));
                Object.keys(current).forEach((key: string) => {
                    if (current[key] !== previous[key]) {
                        changes[key] = {
                            previous: previous[key],
                            current: current[key]
                        }
                    }
                });
                previous = current;
                if (Object.keys(changes).length > 0) {
                    constructedValue.onChanges(changes);
                }
            }, 100);

            constructedValue.onDestroy = () => {
                if (originalOnDestroy) {
                    originalOnDestroy();
                }
                clearInterval(interval);
            }
            return constructedValue;
        }
        
        Object.defineProperty(frameConstructor, 'name', {value: constructor.name, writable: false});
        Object.defineProperty(frameConstructor, 'isFrame', { value: true, writable: false });
        return <any>frameConstructor;
    }
    return frame;
}