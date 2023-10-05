
export const isNumeric = (str: any) => {
    if (typeof str != "string") return false;
    return !isNaN(str as any) &&
           !isNaN(parseFloat(str));
}

export function Prop() {
    return function(target: any, propertyKey: any) { 
        let key = Symbol();
        const getter = function() {
            return this[key];
        };
        const setter = function(newVal: any) {
            if (newVal && isNumeric(newVal)) {
                this[key] = parseFloat(newVal);
            } else {
                this[key] = newVal;     
            }
        }; 
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true
        });
        const previousProps = target['inputProps'] ? target['inputProps'] : [];
        Object.defineProperty(target, 'inputProps', {
            value: [...previousProps, "data-" + propertyKey],
            writable: true
        });
    }
}