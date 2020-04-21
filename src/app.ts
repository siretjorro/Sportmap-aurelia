import { PLATFORM } from 'aurelia-pal';
import { autoinject } from 'aurelia-framework';
import { RouterConfiguration, Router } from 'aurelia-router';
import * as environment from '../config/environment.json';

@autoinject
export class App {
    router?: Router;

    envstr = JSON.stringify(environment);

    configureRouter(config: RouterConfiguration, router: Router): void {
        this.router = router;
        config.title = 'SportMap';
        config.map([
            {route: ['','home'], name: 'home', moduleId: PLATFORM.moduleName('views/home/index'), nav: true, title: 'Home'},
        ]);

        config.mapUnknownRoutes('views/home/index');
    }
}
