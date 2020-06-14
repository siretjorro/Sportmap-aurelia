import { autoinject} from 'aurelia-framework';
import { BaseService } from './base-service';
import { HttpClient } from 'aurelia-fetch-client';
import { ITrackPoint } from 'domain/ITrackPoint';

@autoinject
export class TrackPointService extends BaseService<ITrackPoint> {
    constructor(protected httpClient: HttpClient) {
        super('TrackPoints', httpClient);
    }
}
