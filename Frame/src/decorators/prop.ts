import { isNumeric } from "../core/componentValue";


export function Prop() {
    return function(target, propertyKey) { 
        let key = Symbol();
        const getter = function() {
            return this[key];
        };
        const setter = function(newVal: any) {
            let previous = this[key];
            if (newVal && isNumeric(newVal)) {
                this[key] = parseFloat(newVal);
            } else {
                this[key] = newVal;     
            }
            if (this.onChanges) {
                this.onChanges({
                    [propertyKey]: {
                        previous,
                        current: this[key]
                    }
                });
            }
        }; 
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true
        });
    }
}