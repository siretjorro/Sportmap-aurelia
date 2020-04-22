import { IGpsLocation } from 'domain/IGpsLocation';
import { log } from 'app';


export function distanceBetweenLatLon(lat1: number, lon1: number, lat2: number, lon2: number): number {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        const radlat1 = Math.PI * lat1 / 180;
        const radlat2 = Math.PI * lat2 / 180;
        const theta = lon1 - lon2;
        const radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1853.159616; // in meters
        return dist;
    }
}

function timeBetweenDates(date0: Date, date1: Date): number {
    return Math.abs(date0.getTime() - date1.getTime());
}


function addToBucket(buckets: L.LatLngExpression[][][], bucketNo: number, latLon: L.LatLngExpression, latLonPrev: L.LatLngExpression): L.LatLngExpression[][][] {
    if (bucketNo >= buckets.length) return buckets;

    buckets[bucketNo].push([latLonPrev, latLon]);

    return buckets;
}
// minSpeed and maxSpeed - seconds per km
export function getColorCodedPolylines(locations: IGpsLocation[], minPace: number = 6*60, maxPace: number = 18*60, paceBuckets: number = 256): L.LatLngExpression[][][] {
    if (!locations || locations.length == 0) return [];

    const result: L.LatLngExpression[][][] = [];
    for (let index = 0; index < paceBuckets; index++) {
        result.push([]);
    }

    const paceRange = maxPace - minPace;
    const paceStep = paceRange / paceBuckets;


    let prevLocation: IGpsLocation | null = null;

    for (let index = 0; index < locations.length; index++) {
        const location = locations[index];

        if (prevLocation) {
            const distance = distanceBetweenLatLon(location.latitude, location.longitude, prevLocation.latitude, prevLocation.longitude);
            const duration = timeBetweenDates(new Date(location.recordedAt), new Date(prevLocation.recordedAt));
            // skip bad locations
            if (distance < 1 || duration < 1000) continue;

            // calculate the speed in minutes per km
            const paceSecondsPerKm = duration / distance ;
            let bucketNo = Math.round(((paceSecondsPerKm - minPace) / paceStep));
            if (bucketNo < 0) {
                bucketNo = 0
            } else if (bucketNo >= paceBuckets){
                bucketNo = paceBuckets - 1;
            }
            //console.log(paceSecondsPerKm, bucketNo);
            addToBucket(result, bucketNo, [location.latitude, location.longitude], [prevLocation.latitude, prevLocation.longitude]);

            //log.debug('distance duration pace', distance, duration, paceMinutesPerKm);
        }
        prevLocation = location;

    }

    console.log(result);

    return result;
}

