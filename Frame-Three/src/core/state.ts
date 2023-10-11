import { Injectable } from "../decorators";
import { Constructor } from "./types";

export class Term<T> {
    private v: T | null;
    
    constructor(v: T | null) {
        this.v = v;
    }

    get value() {
        return this.v;
    }

    set setValue(v: T) {
        this.v = v;
    }
}

interface Terms {
    name: string;
    term: Term<any>
}

interface Prox {
    uuid: string;
    proxy: any;
    cb: (value: any) => void;
}

export type ContractTerms<T> = {onChanges: (cb: (value: T) => void) => void, unsubscribe: () => void} & T;

export abstract class Contract<T> {
    protected terms: Terms[];
    private proxies: Prox[] = [];

    public getTerms = (): ContractTerms<T> => {

        const _this = this;

        const resultTerms = this.terms.reduce<T>((acc: T, term: Terms) =>  {
            return Object.assign(acc as any, { [term.name]: term.term.value } as any) as T;
        }, {} as T);

        resultTerms["uuid"] = Symbol();

        resultTerms["unsubscribe"] = function() {
            _this.proxies = _this.proxies.filter((p: Prox) => p.uuid !== this.uuid);
        }

        resultTerms["onChanges"] = function(cb: (value: T) => void) {
            _this.proxies.push(
                {
                    uuid: this.uuid,
                    cb,
                    proxy: new Proxy(this, {
                        set: function (target: T, key: string, value: any) {
                            target[key] = value;
                            cb(target);
                            return true;
                        }
                    })
                }
            )
        };

        return resultTerms as ContractTerms<T>;
    }

    public getTerm = <T>(name: string): T => {
        return this.terms.find((term: Terms) => term.name === name)?.term.value;
    }

    public setTerm = <T>(name: string, value: T): void => {
        const terms = this.terms.find((term: Terms) => term.name === name);
        if (terms) {
            terms.term.setValue = value;
            if (this.proxies.length > 0) {
                this.proxies.forEach((prox: Prox) => {
                    prox.proxy[name] = value;
                });
            }
        }
    }
}

@Injectable()
export class StateService {
    public getContract = <T>(c: Constructor<T>): T | undefined => {
        return State.getContract(c);
    }
}

interface StateContractStorage {
    name: string;
    contract: Contract<any>;
}

export class State {
    static isState: boolean = true;
    private static contracts: StateContractStorage[];

    static setStates = (contracts: Constructor<any>[]): Constructor<void> => {
        this.contracts = contracts.map((c: Constructor<any>) => {
            const contract = new c();
            if ('getTerms' in contract && 'getTerm' in contract) {
                return {
                    name: c.prototype.constructor.name,
                    contract: contract
                }
            }
            return null
        }).filter((i) => i !== null) as StateContractStorage[];
        return State as any;
    }

    static getContract = <T>(c: Constructor<T>): T | undefined => {
        return this.contracts.find((value: StateContractStorage) => value.name === c.prototype.constructor.name)?.contract as T | undefined;
    }
}