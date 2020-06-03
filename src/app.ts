import { ICulture } from './domain/ICulture';
import { CultureService } from './services/culture-service';
import { PLATFORM } from 'aurelia-pal';
import { autoinject, LogManager, View, observable } from 'aurelia-framework';
import { RouterConfiguration, Router, RouteConfig, NavigationInstruction } from 'aurelia-router';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import * as environment from '../config/environment.json';
import { HttpClient } from 'aurelia-fetch-client';
import { Store, connectTo } from "aurelia-store";
import { IState } from 'state/state';
import { LayoutResources } from 'lang/LayoutResources';
export const log = LogManager.getLogger('app.App');

@connectTo()
@autoinject
export class App {
    router?: Router;
    private subscriptions: Subscription[] = [];
    private swaggerUrl = environment.swaggerUrl;

    public state!: IState;

    private langResources = LayoutResources;

    constructor(private store: Store<IState>, private cultureService: CultureService, private httpClient: HttpClient) {
        this.httpClient.configure(config => {
            config
                .withBaseUrl(environment.backendUrl)
                .withDefaults({
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'Fetch'
                    }
                })
                .withInterceptor({
                    request(request) {
                        console.log(`Requesting ${request.method} ${request.url}`);
                        return request;
                    },
                    response(response) {
                        console.log(`Received ${response.status} ${response.url}`);
                        return response;
                    }
                });
        });
        this.store.registerAction('stateUpdateCultures', this.stateUpdateCultures);
        this.store.registerAction('stateUpdateSelectedCulture', this.stateUpdateSelectedCulture);
        this.store.registerAction('stateRemoveJwt', this.stateRemoveJwt);
    }

    // ================================= view lifecycle ===============================
    created(owningView: View, myView: View): void {
        log.debug("created");

    }

    bind(bindingContext: Record<string, any>, overrideContext: Record<string, any>): void {
        log.debug("bind");
    }

    async attached(): Promise<void> {
        log.debug("attached");

        // get the languages from backend
        const result = await this.cultureService.getAll();
        if (result.statusCode >= 200 && result.statusCode < 300) {
            log.debug('data', result.data);
            if (result.data) {
                this.store.dispatch(this.stateUpdateCultures, result.data);
            }
        }
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
            { route: 'tracks', name: 'tracks', moduleId: PLATFORM.moduleName('views/tracks/index'), nav: true, title: 'Tracks' },
            { route: 'account/login', name: 'account-login', moduleId: PLATFORM.moduleName('views/account/login'), nav: false, title: 'Login' },
            { route: 'account/register', name: 'account-register', moduleId: PLATFORM.moduleName('views/account/register'), nav: false, title: 'Register' },
        ]);

        config.mapUnknownRoutes('views/home/index');
    }

    // ================================= View  ===============================

    setCulture(culture: ICulture): void {
        this.store.dispatch(this.stateUpdateSelectedCulture, culture);
    }

    logoutOnClick(): void {
        this.store.dispatch(this.stateRemoveJwt);

        if (this.router) {
            this.router.navigateToRoute('account-login');
        }
    }

    // ================================= Event  ===============================

    // ================================= Helpers  ===============================


    // ================================= State  ===============================

    // take the old state, make shallow copy, update copy, return as new state
    stateUpdateCultures(state: IState, cultures: ICulture[]): IState {
        const newState = Object.assign({}, state);
        newState.cultures = cultures;
        return newState;
    }

    stateUpdateSelectedCulture(state: IState, culture: ICulture): IState {
        const newState = Object.assign({}, state);
        newState.selectedCulture = culture;
        return newState;
    }

    stateRemoveJwt(state: IState): IState {
        const newState = Object.assign({}, state);
        newState.jwt = undefined;
        return newState;
    }
}
