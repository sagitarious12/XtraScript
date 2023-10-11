import { Injectable } from "../decorators";
import { Constructor } from "./types";

class Term<T> {
    private v: T | null;
    
    constructor(v: T | null) {
        this.v = v;
    }

    get value() {
        return this.value;
    }

    set setValue(v: T) {
        this.v = v;
    }
}

interface Terms {
    name: string;
    term: Term<any>
}

class Contract {
    protected terms: Terms[];

    public getContract = () => {
        return this.terms.reduce<{[key: string]: any}>((acc: {[key: string]: any}, term: Terms) =>  {
            return Object.assign(acc, { [term.name]: term.term });
        }, {});
    }

    public getTerm = <T>(name: string): Term<T> | null => {
        return this.terms.find((term: Terms) => term.name === name)?.term.value || null;
    }

    protected setTerm = <T>(name: string, value: T): void => {
        const terms = this.terms.find((term: Terms) => term.name === name);
        if (terms) {
            terms.term.setValue(value);
        }
    }
}

class TestContract extends Contract {
    constructor(){
        super();
        this.terms = [{ name: 'text', term: new Term<string>('Hello World From Test Contract') }];
    }


}

@Injectable()
export class StateService {
    public getContract = (c: Constructor<Contract>) => {
        return State.getContract(c);
    }
}

interface StateContractStorage {
    name: string;
    contract: Contract;
}

export class State {
    static isState: boolean = true;
    private static contracts: StateContractStorage[];

    static setStates = (contracts: Constructor<Contract>[]): Constructor<void> => {
        this.contracts = contracts.map((c: Constructor<Contract>) => {
            return {
                name: c.prototype.constructor.name,
                contract: new c()
            }
        });

        return State as any;
    }

    static getContract = (c: Constructor<Contract>): Contract | undefined => {
        return this.contracts.find((value: StateContractStorage) => value.name === c.prototype.constructor.name)?.contract;
    }
}



// usage
/**
 * 

@frame({})
class SomeFrame implements onInit {
    const state = State.get(SomeContract);

    onInit() {

    }
}


 */