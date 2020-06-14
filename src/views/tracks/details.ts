import { ITrackPoint } from './../../domain/ITrackPoint';
import { TrackPointService } from './../../services/trackpoint-service';
import { autoinject, observable } from 'aurelia-framework';
import { RouteConfig, NavigationInstruction } from 'aurelia-router';
import { TrackService } from './../../services/track-service';
import { ITrack } from './../../domain/ITrack';
import gradstop from 'gradstop';
import * as L from 'leaflet';
import { distanceBetweenLatLon, getColorCodedPolylines, getColorCodedPolylines2 } from 'utils/utils-leaflet';

@autoinject
export class TrackDetails {
    private _latitude!: number | null;
    private _longitude!: number | null;
    private _accuracy!: number | null;
    private _passOrder!: number | null;
    private _trackPoint!: ITrackPoint;
    private _trackId: string = "";
    map!: L.Map;

    trackLength = 0;
    viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    private paceColorGradient: string[] = [];

    private _track?: ITrack | null;
    private _trackpoints: ITrackPoint[] = [];

    constructor(private trackService: TrackService, private trackPointService: TrackPointService) {
        this.paceColorGradient = gradstop({
            stops: 256,
            inputFormat: 'hex',
            colorArray: ['#00FF00', '#FFFF00', '#FF0000']
        });
    }

    attached(): void {
        const elem = document.querySelector('#map');
        if (elem) {
            elem.setAttribute('style', 'height: ' + (this.viewportHeight * .8).toString() + 'px;');
        }


        this.map = L.map('map').setView([59.3953607, 24.6643414], 18);
        //this.map = L.map('map').setView([59.3245441,25.6506961], 14);

        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        ).addTo(this.map);

    }

    activate(params: any, routeConfig: RouteConfig, navigationInstruction: NavigationInstruction): void {
        if (params.id && typeof (params.id) == 'string') {
            this._trackId = params.id;

            this.trackService.get(params.id).then(
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

            this.trackPointService.getAll({ trackId: params.id }).then(
                response => {
                    if (response.data) {
                        this._trackpoints = response.data.sort(function (a, b) {
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
                        console.log(this._trackpoints);
                        this.visualizeSession();
                    }
                }
            );
        }
    }

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
                                    this._trackpoints = response.data;
                                    console.log(this._trackpoints);
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

        const paceBuckets = getColorCodedPolylines2(this._trackpoints, minPace, maxPace, this.paceColorGradient.length);

        this._trackpoints.forEach((location, index) => {
            polylinePoints.push([location.latitude, location.longitude]);

            if (index > 0) {
                this.trackLength = this.trackLength + distanceBetweenLatLon(
                    this._trackpoints[index - 1].latitude, this._trackpoints[index - 1].longitude,
                    location.latitude, location.longitude);

                console.log(this._trackpoints[index - 1].longitude);
            }

            console.log(location.latitude);
            L.marker([location.latitude, location.longitude], { icon: iconTp }).addTo(this.map);

        });

        paceBuckets.forEach((paceSegment, bucketNo) => {
            paceSegment.forEach(lineSegment => {
                const polyline = L.polyline(lineSegment).setStyle({
                    color: this.paceColorGradient[bucketNo],
                    weight: 5
                }).addTo(this.map);
            })
        })


        // add start marker
        if (polylinePoints.length > 0) {
            // L.marker([this.gpsLocations[0].latitude, this.gpsLocations[0].longitude], { icon: iconS }).addTo(this.map);
            this.map.setView([this._trackpoints[0].latitude, this._trackpoints[0].longitude], 15);
        }
        // add finish marker
        if (polylinePoints.length > 1) {
            // L.marker([this.gpsLocations[this.gpsLocations.length - 1].latitude, this.gpsLocations[this.gpsLocations.length - 1].longitude], { icon: iconF }).addTo(this.map);
        }

        if (polylinePoints.length > 0) {
            const polyline = L.polyline(polylinePoints);
            this.map.fitBounds(polyline.getBounds());
        }
    }
}
