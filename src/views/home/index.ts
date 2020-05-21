import { IndexResources } from './../../lang/IndexResources';
import { GpsLocationTypes } from './../../domain/GpsLocationTypes';
import { IGpsLocation } from './../../domain/IGpsLocation';
import { GpsLocationService } from './../../services/gpslocation-service';
import { GpsSessionService } from './../../services/gpssession-service';
import { IGpsSession } from './../../domain/IGpsSession';
import { PLATFORM } from 'aurelia-pal';
import { autoinject, LogManager, View, observable } from 'aurelia-framework';
import { RouterConfiguration, Router, RouteConfig, NavigationInstruction } from 'aurelia-router';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import { distanceBetweenLatLon, getColorCodedPolylines } from 'utils/utils-leaflet';
import { decimalToHex } from 'utils/utils-general';
import gradstop from 'gradstop';
import { Store, connectTo } from "aurelia-store";
import { IState } from 'state/state';


export const log = LogManager.getLogger('app.HomeIndex');


@connectTo()
@autoinject
export class HomeIndex {
    private subscriptions: Subscription[] = [];
    public state!: IState;

    map!: L.Map;

    gpsSessions: IGpsSession[] = [];
    gpsLocations: IGpsLocation[] = [];

    @observable
    selectedGpsSession: IGpsSession | null = null;
    showCp = true;
    showWp = true;
    minLocations = 10;
    minDistance = 10;
    minDuration = 60;


    trackLength = 0;

    viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    private paceColorGradient: string[] = [];

    private langResources = IndexResources;


    constructor(private gpsSessionService: GpsSessionService, private gpsLocationService: GpsLocationService) {
        this.paceColorGradient = gradstop({
            stops: 256,
            inputFormat: 'hex',
            colorArray: ['#00FF00', '#FFFF00', '#FF0000']
        });
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
        //this.map = L.map('map').setView([59.3245441,25.6506961], 14);

        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        ).addTo(this.map);



        const imageUrl = '/apuparra.png';


        // start
        // latitude: 59.3245441
        //longitude: 25.6506961

        // finish
        //latitude: 59.3176531
        //longitude: 25.6569272

        /*
                // use this? https://github.com/IvanSanchez/Leaflet.ImageOverlay.Rotated/blob/gh-pages/Leaflet.ImageOverlay.Rotated.js
        
                const topLat= 59.337;
                const topLng = 25.645;
                const width = 0.035;
                const height = 0.025;
                const imageBounds: L.LatLngBoundsExpression = [
                    [topLat, topLng], 
                    [topLat - height, topLng + width]
                ];
        
                L.imageOverlay(imageUrl, imageBounds).addTo(this.map);
                L.imageOverlay(imageUrl, imageBounds).bringToFront();
        */

        this.gpsSessionService.getAll({minLocationsCount: this.minLocations, minDistance: this.minDistance, minDuration: this.minDuration}).then(
            response => {
                if (response.data) {
                    this.gpsSessions = response.data;
                }
            }
        );

    }

    detached(): void {
        log.debug("detached");
        this.subscriptions.forEach(subscription => {
            subscription.dispose();
        });
        this.subscriptions = [];
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



    // ================================= View  ===============================
    reloadSessions(): void {
        this.gpsSessionService.getAll({minLocationsCount: this.minLocations, minDistance: this.minDistance, minDuration: this.minDuration}).then(
            response => {
                if (response.data) {
                    this.gpsSessions = response.data;
                }
            }
        );
    }

    // ================================= Event  ===============================

    // ================================= Helpers  ===============================


    selectedGpsSessionChanged(newValue: IGpsSession, oldValue: IGpsSession): void {
        log.debug('selectedGpsSessionChanged', newValue, oldValue);
        if (this.selectedGpsSession) {
            this.gpsLocationService.getAllForSession(this.selectedGpsSession.id).then(
                result => {
                    if (result.data) {
                        this.gpsLocations = result.data;
                        this.visualizeSession();
                    }
                }
            );
        }
    }

    visualizeSession(): void {

        const iconWp = L.icon({
            iconUrl: '/marker-icon-wp.png',
            iconSize: [25, 41], // size of the icon
            iconAnchor: [13, 41], // point of the icon which will correspond to marker's location
        });

        const iconCp = L.icon({
            iconUrl: '/marker-icon-cp.png',
            iconSize: [25, 41], // size of the icon
            iconAnchor: [13, 41], // point of the icon which will correspond to marker's location
        });
        const iconS = L.icon({
            iconUrl: '/marker-icon-s.png',
            iconSize: [25, 41], // size of the icon
            iconAnchor: [13, 41], // point of the icon which will correspond to marker's location
        });
        const iconF = L.icon({
            iconUrl: '/marker-icon-f.png',
            iconSize: [25, 41], // size of the icon
            iconAnchor: [13, 41], // point of the icon which will correspond to marker's location
        });


        const polylinePoints: L.LatLngExpression[] = [];
        this.trackLength = 0;

        const minPace = this.selectedGpsSession?.paceMin ? this.selectedGpsSession?.paceMin : 6 * 60;
        const maxPace = this.selectedGpsSession?.paceMax ? this.selectedGpsSession?.paceMax : 18 * 60;

        const paceBuckets = getColorCodedPolylines(this.gpsLocations, minPace, maxPace, this.paceColorGradient.length);

        this.gpsLocations.forEach((location, index) => {
            polylinePoints.push([location.latitude, location.longitude]);

            if (index > 0) {
                this.trackLength = this.trackLength + distanceBetweenLatLon(
                    this.gpsLocations[index - 1].latitude, this.gpsLocations[index - 1].longitude,
                    location.latitude, location.longitude);
            }

            if (location.gpsLocationTypeId == GpsLocationTypes.wayPoint && this.showWp) {
                //log.debug('adding wp  to ', [location.latitude, location.longitude])
                L.marker([location.latitude, location.longitude], { icon: iconWp }).addTo(this.map);
            } else
                if (location.gpsLocationTypeId == GpsLocationTypes.checkPoint && this.showCp) {
                    //log.debug('adding cp to ', [location.latitude, location.longitude])
                    L.marker([location.latitude, location.longitude], { icon: iconCp }).addTo(this.map);
                }

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
            L.marker([this.gpsLocations[0].latitude, this.gpsLocations[0].longitude], { icon: iconS }).addTo(this.map);
            this.map.setView([this.gpsLocations[0].latitude, this.gpsLocations[0].longitude], 15);
        }
        // add finish marker
        if (polylinePoints.length > 1) {
            L.marker([this.gpsLocations[this.gpsLocations.length - 1].latitude, this.gpsLocations[this.gpsLocations.length - 1].longitude], { icon: iconF }).addTo(this.map);
        }

        /*
        if (polylinePoints.length > 0) {
            const polyline = L.polyline(polylinePoints).addTo(this.map);
            this.map.fitBounds(polyline.getBounds());
        }
        */

    }


}

