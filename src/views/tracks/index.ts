import { RouteConfig, NavigationInstruction } from 'aurelia-router';
import { Confirm } from '../../components/confirm/confirm';
import { TrackPointService } from './../../services/trackpoint-service';
import { ITrackPoint } from './../../domain/ITrackPoint';
import { IFetchResponse } from './../../types/IFetchResponse';
import { TrackService } from './../../services/track-service';
import { LogManager, autoinject, View } from 'aurelia-framework';
import { ITrack } from 'domain/ITrack';
import { distanceBetweenLatLon, getColorCodedPolylines } from 'utils/utils-leaflet';
import { getNumberOfTrackpoints, getTrackLength } from 'utils/utils-general';
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
    editing = null;

    filters = [
        { value: '', keys: ['name', 'description'] },
    ];

    constructor(private trackService: TrackService, private trackPointService: TrackPointService) {
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

        await this.trackService.getAll().then(
            response => {
                if (response.data) {
                    this.tracks = response.data;
                }
            }
        );
    }

    detached(): void {
        log.debug("detached");
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

    // ================================= Helpers  ===============================
    async getNumberOfTrackpoints(id: string): Promise<number> {
        return getNumberOfTrackpoints(id, this.trackPointService);
    }

    async getTrackLength(id: string): Promise<number> {
        return getTrackLength(id, this.trackPointService);
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

    rowSelected($event: { detail: { row: any } }): void {
        this.editing = $event.detail.row;
    }

    update(track: ITrack): void {
        this.trackService.put(track);
        this.editing = null;
    }
}
