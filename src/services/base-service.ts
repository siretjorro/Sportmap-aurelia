import { autoinject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import * as environment from '../../config/environment.json';
import { IFetchResponse } from 'types/IFetchResponse';

@autoinject
export class BaseService<TEntity> {


    private authHeaders = {
        'Authorization': 'Bearer '
    }

    constructor(protected apiEndpointUrl: string, protected httpClient: HttpClient) {
        this.httpClient.configure(config => {
            config
                .withBaseUrl(environment.backendUrl)
                .withDefaults({
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'Fetch'
                    }
                })
                .withInterceptor({
                    request(request) {
                        console.log(`Requesting ${request.method} ${request.url}`);
                        return request;
                    },
                    response(response) {
                        console.log(`Received ${response.status} ${response.url}`);
                        return response;
                    }
                });
        });



    }

    async getAll(): Promise<IFetchResponse<TEntity[]>> {
        try {
            const response = await this.httpClient
                .fetch(this.apiEndpointUrl, {
                    cache: "no-store",
                    headers:this.authHeaders
                });
            // happy case
            if (response.ok) {
                const data = (await response.json()) as TEntity[];
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

    async get(id: string): Promise<IFetchResponse<TEntity>> {
        try {
            const response = await this.httpClient
                .fetch(this.apiEndpointUrl + '/' + id, {
                    cache: "no-store",
                    headers: this.authHeaders
                });
            // happy case
            if (response.ok) {
                const data = (await response.json()) as TEntity;
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



}
