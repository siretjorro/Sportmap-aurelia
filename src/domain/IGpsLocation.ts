export interface IGpsLocation {
    id: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number;
    verticalAccuracy: number;
    gpsLocationTypeId: string;
}
