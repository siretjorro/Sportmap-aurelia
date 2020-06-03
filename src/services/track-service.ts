import { IState } from './../state/state';
import { ITrack } from './../domain/ITrack';
import { ILoginResponse } from '../domain/ILoginResponse';
import { autoinject, observable } from 'aurelia-framework';
import { BaseService } from './base-service';
import { HttpClient } from 'aurelia-fetch-client';
import { Store } from 'aurelia-store';

@autoinject
export class TrackService extends BaseService<ITrack> {

    @observable state!: IState;
    constructor(private store: Store<IState>, protected httpClient: HttpClient) {
        super('Tracks', httpClient);
        store.state.subscribe(newState => this.state = newState);
        console.log(this.state);
    }
}
