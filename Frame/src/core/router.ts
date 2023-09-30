import { Capsule } from "../decorators/capsule";
import { Injectable } from "../decorators/injectable";
import { Component } from "../types/baseTypes";
import { createRouterElements } from "./createWebPage";
import * as Dep from './dependency-injector';
const depinj = new Dep.DependencyInjector();
(window as any).dependencies = depinj;

export interface Route {
    title: string;
    path: string;
    component: Component;
    default?: boolean;
}

export class RouterCapsule {
    static isRouter: boolean = true;
    private static routes: Route[] = [];
    private static childRoutes: { [capsuleName: string]: Route[]} = {};
    private static activePath: string = '';

    private static currentActiveComponents: void[] = [];

    static setRootRoutes = (routes: Route[]): Component => {
        this.routes = routes;
        return RouterCapsule;
    }
    static setChildRoutes = (routes: Route[], capsule: Component): Component => {
        this.childRoutes[capsule.prototype.constructor.name] = routes;
        return RouterCapsule;
    }
    static getRoutes = (component: Component) => {
        const foundChild = Object.keys(this.childRoutes).find((value: string) => value === component.prototype.constructor.name);
        if (!foundChild) {
            return this.routes;
        } else {
            return foundChild;
        }
    }
    static setRoute = (path: string) => {
        this.currentActiveComponents.forEach((value: void) => {
            (value as any).onDestroy();
        });
        this.currentActiveComponents = [];
        const pathSplit = path.split('?');
        const route = this.routes.find((r: Route) => r.path === pathSplit[0]);
        if (route) {
            history.pushState(null, "", route.path);
            RouterFeed.setRouteContent(route);
        } else {
            let childRoute;
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
                console.error("No Valid Route Found That Matches Path Supplied To Router");
                let routes = [...this.routes];
                Object.keys(this.childRoutes).forEach((c: string) => routes.push(...this.childRoutes[c]))
                console.error("Available Routes", routes);
            }
        }
    }
    static getActiveRoute = (): string => {
        return this.activePath;
    } 

    static addActiveComponent = (component: void) => {
        this.currentActiveComponents.push(component);
    }
}

@Injectable()
export class RouterService {
    setRoute = (path: string) => {
        RouterCapsule.setRoute(path);
    }

    getUrl = (): string => {
        return RouterCapsule.getActiveRoute();
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
        const elem = createRouterElements(route.component);
        this._root?.replaceChildren(elem);
    }
}
customElements.define('router-feed', RouterFeed);