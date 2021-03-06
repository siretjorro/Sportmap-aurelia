import { ITrack } from './../domain/ITrack';
import { autoinject} from 'aurelia-framework';
import { BaseService } from './base-service';
import { HttpClient } from 'aurelia-fetch-client';

@autoinject
export class TrackService extends BaseService<ITrack> {
    constructor(protected httpClient: HttpClient) {
        super('Tracks', httpClient);
    }
}
