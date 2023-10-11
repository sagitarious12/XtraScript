export interface EmitterValue {
    value: string;
    another: string;
}

export interface Emitter<T = {}> {
    emit: ((args: T) => void) | (() => void);
}

export function Emit() {
    return function(target: any, propertyKey: any) {
        let fn: Function;
        const emit = (...args: any[]) => {
            fn(...args);
        }
        const getter = () => {
            return {
                emit
            };
        }
        const setter = (emitFn: Function) => {
            fn = emitFn;
        }
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter
        })
    }
}