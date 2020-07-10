import { TrackPointService } from './../../services/trackpoint-service';
import { ITrackPoint } from './../../domain/ITrackPoint';
import { IFetchResponse } from './../../types/IFetchResponse';
import { TrackService } from './../../services/track-service';
import { LogManager, autoinject } from 'aurelia-framework';
import { ITrack } from 'domain/ITrack';
import { distanceBetweenLatLon, getColorCodedPolylines } from 'utils/utils-leaflet';
export const log = LogManager.getLogger('app.App');

@autoinject
export class Tracks {
    tracks: ITrack[] = [];
    trackPoints: Map<string, ITrackPoint[]> = new Map();
    trackPoints1: ITrackPoint[] = [];
    trackPoints2 = {};

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
        let n = 0;

        await this.trackPointService.getAll({ trackId: id }).then(
            response => {
                if (response.data) {
                    n = response.data.length;
                }
            }
        );

        return n;
    }

    async trackLength(id: string): Promise<number> {
        let trackPoints: ITrackPoint[] = [];
        let trackLength = 0;

        await this.trackPointService.getAll({ trackId: id }).then(
            response => {
                if (response.data) {
                    trackPoints = response.data;
                }
            }
        );

        trackPoints.forEach((location, index) => {
            if (index > 0) {
                trackLength = trackLength + distanceBetweenLatLon(
                    trackPoints[index - 1].latitude, trackPoints[index - 1].longitude,
                    location.latitude, location.longitude);
            }
        });

        return Math.round(trackLength / 1000);
    }
    
    lengthSort(a: number, b: number, sortOrder: number): number{
        if (a === b) {
            return 0;
        }

        if (a > b) {
            return 1 * sortOrder;
        }

        return -1 * sortOrder;
    }
}
