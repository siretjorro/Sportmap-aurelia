export interface IGpsSession {
    id: string;
    name: string;
    description: string;
    recordedAt: string;
    duration: number;
    speed: number;
    distance: number;
    climb: number;
    descent: number;
    paceMin: number;
    paceMax: number;
    gpsLocationsCount: number;
    userFirstLastName: string;
}
