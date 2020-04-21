import { IGpsLocation } from './../../domain/IGpsLocation';
import { GpsLocationService } from './../../services/gpslocation-service';
import { GpsSessionService } from './../../services/gpssession-service';
import { IGpsSession } from './../../domain/IGpsSession';
import { PLATFORM } from 'aurelia-pal';
import { autoinject, LogManager, View, observable } from 'aurelia-framework';
import { RouterConfiguration, Router, RouteConfig, NavigationInstruction } from 'aurelia-router';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export const log = LogManager.getLogger('app.HomeIndex');

@autoinject
export class HomeIndex {
    private subscriptions: Subscription[] = [];

    map!: L.Map;

    gpsSessions: IGpsSession[] = [];
    @observable
    selectedGpsSession: IGpsSession | null = null;

    gpsLocations: IGpsLocation[] = [];

    constructor(private gpsSessionService: GpsSessionService, private gpsLocationService: GpsLocationService) {

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

        this.map = L.map('map').setView([59.3953607, 24.6643414], 15);
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        ).addTo(this.map);


        this.gpsSessionService.getAll().then(
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
        const polylinePoints: L.LatLngExpression[] = [];
        this.gpsLocations.forEach(location => {
            polylinePoints.push([location.latitude, location.longitude]);
        });

        const polyline = L.polyline(polylinePoints).addTo(this.map);
        this.map.fitBounds(polyline.getBounds());
    }
}

