import { PLATFORM } from 'aurelia-pal';
import { autoinject, LogManager, View } from 'aurelia-framework';
import { RouterConfiguration, Router, RouteConfig, NavigationInstruction } from 'aurelia-router';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import * as environment from '../config/environment.json';

export const log = LogManager.getLogger('app.App');

@autoinject
export class App {
    router?: Router;
    private subscriptions: Subscription[] = [];
    private swaggerUrl = environment.swaggerUrl;


    // ================================= view lifecycle ===============================
    created(owningView: View, myView: View): void {
        log.debug("created");

    }

    bind(bindingContext: Record<string, any>, overrideContext: Record<string, any>): void {
        log.debug("bind");
    }

    attached(): void {
        log.debug("attached");
    }

    detached(): void {
        log.debug("detached");
        this.subscriptions.forEach(subscription => {
            subscription.dispose();
        });
        this.subscriptions = [];
    }

    unbind(): void {
        log.debug("unbind");
    }

    // ================================= Route lifecycle  ===============================
    canActivate(params: any, routeConfig: RouteConfig, navigationInstruction: NavigationInstruction): void {
        log.debug("canActivate");
    }

    activate(params: any, routeConfig: RouteConfig, navigationInstruction: NavigationInstruction): void {
        log.debug("activate");
    }

    canDeactivate(): void {
        log.debug("canDeactivate");
    }

    deactivate(): void {
        log.debug("deactivate");
    }

    configureRouter(config: RouterConfiguration, router: Router): void {
        this.router = router;
        config.title = 'SportMap';
        config.map([
            { route: ['', 'home'], name: 'home', moduleId: PLATFORM.moduleName('views/home/index'), nav: true, title: 'Home' },
        ]);

        config.mapUnknownRoutes('views/home/index');
    }

    // ================================= View  ===============================

    // ================================= Event  ===============================

    // ================================= Helpers  ===============================



}
