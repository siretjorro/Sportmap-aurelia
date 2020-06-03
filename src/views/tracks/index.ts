import { IFetchResponse } from './../../types/IFetchResponse';
import { TrackService } from './../../services/track-service';
import { LogManager, autoinject } from 'aurelia-framework';
import { ITrack } from 'domain/ITrack';
export const log = LogManager.getLogger('app.App');

@autoinject
export class Tracks {
    tracks: ITrack[] = [];

    constructor(private trackService: TrackService) {
    }

    // ================================= view lifecycle ===============================
    async attached(): Promise<void> {
        log.debug("attached");

        this.trackService.getAll().then(
            response => {
                if (response.data) {
                    this.tracks = response.data;
                    console.log(this.tracks);
                }
            }
        );
    }
}
