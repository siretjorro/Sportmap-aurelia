import {Aurelia, LogManager} from 'aurelia-framework';
import * as environment from '../config/environment.json';
import {PLATFORM} from 'aurelia-pal';
import { ConsoleAppender } from 'aurelia-logging-console';
import { ILogLevel } from 'types/ILogLevel';
import { queryStringValue, validateLogLevel } from 'utils/utils-general';
import 'whatwg-fetch';

import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../static/site.css';

let logLevel = environment.logLevel;
const queryLogLevel = queryStringValue('loglevel');
if (queryLogLevel) {
    logLevel = validateLogLevel(queryLogLevel);
}


LogManager.addAppender(new ConsoleAppender());
switch (logLevel) {
    case ILogLevel.debug:
        LogManager.setLevel(LogManager.logLevel.debug);
        break;
    case ILogLevel.info:
        LogManager.setLevel(LogManager.logLevel.info);
        break;
    case ILogLevel.warn:
        LogManager.setLevel(LogManager.logLevel.warn);
        break;
    case ILogLevel.error:
        LogManager.setLevel(LogManager.logLevel.error);
        break;
    case ILogLevel.none:
    default:
        LogManager.setLevel(LogManager.logLevel.none);
        break;
}

export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'));

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
