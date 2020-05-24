import { IGpsLocation } from './../domain/IGpsLocation';
import { autoinject } from 'aurelia-framework';
import { BaseService } from './base-service';
import { IGpsSession } from 'domain/IGpsSession';
import { HttpClient } from 'aurelia-fetch-client';
import { IFetchResponse } from 'types/IFetchResponse';

@autoinject
export class GpsLocationService extends BaseService<IGpsLocation> {
    
    constructor(protected httpClient: HttpClient){
        super('GpsLocations', httpClient);
    }


    async getAllForSession(gpsSessionId: string): Promise<IFetchResponse<IGpsLocation[]>> {
        try {
            const response = await this.httpClient
                .fetch(this.apiEndpointUrl + '?gpsSessionId=' + gpsSessionId, {
                    cache: "no-store"
                });
            // happy case
            if (response.ok) {
                const data = (await response.json()) as IGpsLocation[];
                // console.log(data);
                return {
                    statusCode: response.status,
                    data: data
                }
            }

            // something went wrong
            return {
                statusCode: response.status,
                errorMessage: response.statusText
            }

        } catch (reason) {
            return {
                statusCode: 0,
                errorMessage: JSON.stringify(reason)
            }
        }
    }

}
