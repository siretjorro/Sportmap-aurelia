export interface ITrackPoint {
    id?: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    passOrder?: number;
    trackId: string;
    appUserId?: string;
}
