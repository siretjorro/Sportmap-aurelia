import { ITrackPoint } from './../../domain/ITrackPoint';
import { TrackPointService } from './../../services/trackpoint-service';
import { autoinject, LogManager, View } from 'aurelia-framework';
import { RouteConfig, NavigationInstruction } from 'aurelia-router';
import { TrackService } from './../../services/track-service';
import { ITrack } from './../../domain/ITrack';
import * as L from 'leaflet';
import { distanceBetweenLatLon, getColorCodedPolylines2 } from 'utils/utils-leaflet';
import { getNumberOfTrackpoints, getTrackLength } from 'utils/utils-general';

export const log = LogManager.getLogger('app.HomeIndex');


@autoinject
export class TrackDetails {
    private _latitude!: number | null;
    private _longitude!: number | null;
    private _accuracy!: number | null;
    private _passOrder!: number | null;

    private _trackPoint!: ITrackPoint;

    editing = null;
    private trackpointInEditing!: ITrackPoint | null;

    private _trackId: string = "";
    private _track?: ITrack | null = {} as ITrack;
    private trackpoints: ITrackPoint[] = [];
    trackLength = 0;

    map!: L.Map;
    viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    constructor(private trackService: TrackService, private trackPointService: TrackPointService) {
    }

    // ================================= view lifecycle ===============================
    created(owningView: View, myView: View): void {
        log.debug("created");
    }

    bind(bindingContext: Record<string, any>, overrideContext: Record<string, any>): void {
        log.debug("bind");
    }

    attached(): void {
        log.debug("attached");

        const elem = document.querySelector('#map');
        if (elem) {
            elem.setAttribute('style', 'height: ' + (this.viewportHeight * .8).toString() + 'px;');
        }

        this.map = L.map('map').setView([59.3953607, 24.6643414], 18);

        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        ).addTo(this.map);

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

        if (params.id && typeof (params.id) == 'string') {
            this._trackId = params.id;

            this.trackService.get(this._trackId).then(
                response => {
                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        if (response.data) {
                            this._track = response.data;
                        }
                    } else {
                        this._track = undefined;
                    }
                }
            );

            this.trackPointService.getAll({ trackId: this._trackId }).then(
                response => {
                    if (response.data) {
                        this.trackpoints = response.data.sort(function (a, b) {
                            if (a.passOrder && b.passOrder) {
                                if (a.passOrder < b.passOrder) {
                                    return -1;
                                }
                                if (a.passOrder > b.passOrder) {
                                    return 1;
                                }

                            }
                            return 0;
                        });

                        this.visualizeSession();
                    }
                }
            );
        }
    }

    canDeactivate(): void {
        log.debug("canDeactivate");
    }

    deactivate(): void {
        log.debug("deactivate");
    }

    // ================================= Helpers  ===============================

    onSubmit(event: Event): void {
        if (this._latitude && this._longitude) {
            this._trackPoint = { latitude: Number(this._latitude), longitude: Number(this._longitude), trackId: this._trackId };

            if (this._accuracy) {
                this._trackPoint.accuracy = Number(this._accuracy);
            }

            if (this._passOrder) {
                this._trackPoint.passOrder = Number(this._passOrder);
            }

            this.trackPointService.post(this._trackPoint).then(
                response => {
                    if (response.data) {
                        this.trackPointService.getAll({ trackId: this._trackId }).then(
                            response => {
                                if (response.data) {
                                    this.trackpoints = response.data;
                                    this.visualizeSession();
                                }
                            }
                        );
                    }
                }
            );

            this._latitude = null;
            this._longitude = null;
            this._accuracy = null;
            this._passOrder = null;
        }
    }

    clearMap(): void {
        for (const i in (this.map as any)._layers) {
            // clear paths and icons
            if ((this.map as any)._layers[i]._path != undefined || (this.map as any)._layers[i]._icon != undefined) {
                try {
                    this.map.removeLayer((this.map as any)._layers[i]);
                }
                catch (e) {
                    // log.error("problem with " + e + (this.map as any)._layers[i]);
                }
            } else {
                // log.debug((this.map as any)._layers[i]);
            }
        }
    }

    visualizeSession(): void {
        this.clearMap();

        const iconTp = L.icon({
            iconUrl: '/marker-icon-clean.png',
            iconSize: [25, 41], // size of the icon
            iconAnchor: [13, 41], // point of the icon which will correspond to marker's location
        });

        const polylinePoints: L.LatLngExpression[] = [];
        this.trackLength = 0;

        const minPace = 6 * 60;
        const maxPace = 18 * 60;

        const paceBuckets = getColorCodedPolylines2(this.trackpoints, minPace, maxPace);

        this.trackpoints.forEach((location, index) => {
            polylinePoints.push([location.latitude, location.longitude]);

            if (index > 0) {
                this.trackLength = this.trackLength + distanceBetweenLatLon(
                    this.trackpoints[index - 1].latitude, this.trackpoints[index - 1].longitude,
                    location.latitude, location.longitude);

            }

            L.marker([location.latitude, location.longitude], { icon: iconTp }).bindTooltip(index.toString(),
                {
                    permanent: true,
                    direction: 'bottom'
                }
            ).addTo(this.map);
        });

        paceBuckets.forEach((paceSegment, bucketNo) => {
            paceSegment.forEach(lineSegment => {
                const polyline = L.polyline(lineSegment).setStyle({
                    color: "#ff9933",
                    weight: 5
                }).addTo(this.map);
            })
        })


        // set view to polyline
        if (polylinePoints.length > 0) {
            this.map.setView([this.trackpoints[0].latitude, this.trackpoints[0].longitude], 15);
            const polyline = L.polyline(polylinePoints);
            this.map.fitBounds(polyline.getBounds());
        }
    }

    async delete(id: string): Promise<void> {
        await this.trackPointService.delete(id).then(
            response => {
                if (response.data) {
                    console.log("all good");
                }
            }
        );

        this.trackPointService.getAll({ trackId: this._trackId }).then(
            response => {
                if (response.data) {
                    this.trackpoints = response.data.sort(function (a, b) {
                        if (a.passOrder && b.passOrder) {
                            if (a.passOrder < b.passOrder) {
                                return -1;
                            }
                            if (a.passOrder > b.passOrder) {
                                return 1;
                            }

                        }
                        return 0;
                    });

                    this.visualizeSession();
                }
            }
        );
    }

    async getNumberOfTrackpoints(id: string): Promise<number> {
        return getNumberOfTrackpoints(id, this.trackPointService);
    }

    async getTrackLength(id: string): Promise<number> {
        return getTrackLength(id, this.trackPointService);
    }

    rowSelected($event: { detail: { row: any } }): void {
        this.editing = $event.detail.row;
    }

    update(trackpoint: ITrackPoint): void {
        const tp = { id: trackpoint.id, latitude: Number(trackpoint.latitude), longitude: Number(trackpoint.longitude), accuracy: Number(trackpoint.accuracy), passOrder: Number(trackpoint.passOrder), trackId: trackpoint.trackId };
        this.trackPointService.put(tp);
        this.editing = null;
    }
}
