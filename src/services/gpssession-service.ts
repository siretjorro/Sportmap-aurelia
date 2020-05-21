import { autoinject } from 'aurelia-framework';
import { BaseService } from './base-service';
import { IGpsSession } from 'domain/IGpsSession';
import { HttpClient } from 'aurelia-fetch-client';
import { IFetchResponse } from 'types/IFetchResponse';

@autoinject
export class GpsSessionService extends BaseService<IGpsSession> {

    constructor(protected httpClient: HttpClient) {
        super('GpsSessions', httpClient);
    }


/*
    async getAllSessions(minLocations: number, minDistance: number, minDuration: number): Promise<IFetchResponse<IGpsSession[]>> {
        let url = this.apiEndpointUrl;
        url = url + '?minLocationsCount=' + minLocations.toString() + '&minDuration=' + minDuration.toString() + '&minDistance=' + minDistance.toString();
        try {
            const response = await this.httpClient
                .fetch(url, {
                    cache: "no-store",
                });
            // happy case
            if (response.ok) {
                const data = (await response.json()) as IGpsSession[];
                console.log(data);
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
*/
}
