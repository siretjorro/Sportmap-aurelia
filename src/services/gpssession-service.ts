import { autoinject } from 'aurelia-framework';
import { BaseService } from './base-service';
import { IGpsSession } from 'domain/IGpsSession';
import { HttpClient } from 'aurelia-fetch-client';

@autoinject
export class GpsSessionService extends BaseService<IGpsSession> {
    
    constructor(protected httpClient: HttpClient){
        super('GpsSessions', httpClient);
    }



}
