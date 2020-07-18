import { Confirm } from '../../components/confirm/confirm';
import { TrackPointService } from './../../services/trackpoint-service';
import { ITrackPoint } from './../../domain/ITrackPoint';
import { IFetchResponse } from './../../types/IFetchResponse';
import { TrackService } from './../../services/track-service';
import { LogManager, autoinject } from 'aurelia-framework';
import { ITrack } from 'domain/ITrack';
import { distanceBetweenLatLon, getColorCodedPolylines } from 'utils/utils-leaflet';
import { numberOfTrackpoints, trackLength } from 'utils/utils-general';
export const log = LogManager.getLogger('app.App');

@autoinject
export class Tracks {
    private _name!: string | null;
    private _description!: string | null;
    private _track!: ITrack;
    tracks: ITrack[] = [];
    trackPoints: Map<string, ITrackPoint[]> = new Map();
    trackPoints1: ITrackPoint[] = [];
    trackPoints2 = {};

    filters = [
        { value: '', keys: ['name', 'description'] },
    ];

    constructor(private trackService: TrackService, private trackPointService: TrackPointService) {
    }

    // ================================= view lifecycle ===============================
    async attached(): Promise<void> {
        log.debug("attached");

        await this.trackService.getAll().then(
            response => {
                if (response.data) {
                    this.tracks = response.data;
                }
            }
        );
    }

    async numberOfTrackpoints(id: string): Promise<number> {
        return numberOfTrackpoints(id, this.trackPointService);
    }

    async trackLength(id: string): Promise<number> {
        return trackLength(id, this.trackPointService);
    }

    async delete(id: string): Promise<void> {
        await this.trackService.delete(id).then(
            response => {
                if (response.data) {
                    console.log("all good");
                }
            }
        );

        await this.trackService.getAll().then(
            response => {
                if (response.data) {
                    this.tracks = response.data;
                }
            }
        );
    }

    sort(a: number, b: number, sortOrder: number): number {
        if (a === b) {
            return 0;
        }

        if (a > b) {
            return 1 * sortOrder;
        }

        return -1 * sortOrder;
    }

    onSubmit(event: Event): void {
        if (this._name && this._description) {
            this._track = { name: this._name, description: this._description };

            this.trackService.post(this._track).then(
                response => {
                    if (response.data) {
                        this.trackService.getAll().then(
                            response => {
                                if (response.data) {
                                    this.tracks = response.data;
                                }
                            }
                        );
                    }
                }
            );

            this._name = null;
            this._description = null;
        }
    }
}
