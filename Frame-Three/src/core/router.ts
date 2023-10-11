import { Injectable } from '../decorators';
import { Constructor } from './types';

export interface RouteParams {
    [key: string]: string;
}

export interface Route {
    title: string;
    path: string;
    component: Constructor<any>;
    default?: boolean;
    defaultParams?: RouteParams;
}

export class RouterCapsule {
    static isRouter: boolean = true;
    private static routes: Route[] = [];
    private static childRoutes: { [capsuleName: string]: Route[]} = {};
    private static activePath: string = '';
    private static activePathParams: {[key: string]: string} = {};

    static setRootRoutes = (routes: Route[]): Constructor<void> => {
        this.routes = routes;
        const hasDefault = this.routes.find((r: Route) => r.default);
        if (hasDefault) {
            const interval = setInterval(() => {
                if (customElements.get(hasDefault.component.prototype.constructor.selector)) {
                    this.setRoute(hasDefault.path, { params: hasDefault.defaultParams || {}});
                    clearInterval(interval);
                }
            }, 100);
        }
        return RouterCapsule as any;
    }

    static setChildRoutes = (routes: Route[], capsule: Constructor<void>): Constructor<void> => {
        this.childRoutes[capsule.prototype.constructor.name] = routes;
        return RouterCapsule as any;
    }

    static getRoutes = (component: Constructor<void>) => {
        const foundChild = Object.keys(this.childRoutes).find((value: string) => value === component.prototype.constructor.name);
        if (!foundChild) {
            return this.routes;
        } else {
            return foundChild;
        }
    }

    static setRoute = (path: string, options: {params: RouteParams} = {} as any) => {
        const pathSplit = path.split('?');
        const route = this.routes.find((r: Route) => r.path === pathSplit[0]);
        if (route) {
            let path = route.path;
            if (options.params && Object.keys(options.params).length > 0) {
                this.activePathParams = options.params;
                let params: string[] = [];
                Object.keys(options.params).forEach((key) => {
                    params.push(`${key}=${options.params[key]}`);
                })
                path += `?${params.join('&')}`;
            }
            history.pushState(null, "", path);
            RouterFeed.setRouteContent(route);
        } else {
            let childRoute: Route | undefined;
            Object.keys(this.childRoutes).forEach((value: string) => {
                const found = this.childRoutes[value].find((r: Route) => r.path == pathSplit[0]);
                if (found) {
                    childRoute = found;
                }
            });
            if (childRoute) {
                history.pushState(null, "", childRoute.path);
                RouterFeed.setRouteContent(childRoute);
            } else {
                console.error(`No Valid Route Found That Matches Path Supplied To Router: ${path}`);
                let routes = [...this.routes];
                Object.keys(this.childRoutes).forEach((c: string) => routes.push(...this.childRoutes[c]))
                console.error("Available Routes", routes);
            }
        }
    }

    static getActiveRoute = (): string => {
        return this.activePath;
    } 

    static getActiveRouteParams = (): RouteParams => {
        return this.activePathParams;
    }
}

@Injectable()
export class RouterService {
    setRoute = (path: string, options: {params: RouteParams} = {} as any) => {
        RouterCapsule.setRoute(path, options);
    }

    getUrl = (): string => {
        return RouterCapsule.getActiveRoute();
    }

    getParams = (): RouteParams => {
        return RouterCapsule.getActiveRouteParams();
    }
}

export class RouterFeed extends HTMLElement {
    private static _root: ShadowRoot;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        const el = document.createElement('span');
        el.setAttribute('id', 'router-feed');
        this.shadowRoot?.append(el);
        RouterFeed._root = this.shadowRoot as ShadowRoot;
    }

    static setRouteContent = (route: Route) => {
        const selector = route.component.prototype.constructor.selector;
        const elem = customElements.get(selector);
        if (elem) {
            RouterFeed.#setRoute(selector);
        } else {
            console.error(`No element exists in the element registry for selector: ${selector}`)
        }
    }

    static #setRoute = (selector: string) => {
        const element = document.createElement(selector);
        const span = document.createElement('span');
        span.setAttribute('id', 'router-feed');
        span.appendChild(element);
        this._root?.replaceChildren(span);
    }
}
customElements.define('router-feed', RouterFeed);