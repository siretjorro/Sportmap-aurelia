import { autoinject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import * as environment from '../../config/environment.json';
import { IFetchResponse } from 'types/IFetchResponse';
import { IQueryParams } from 'types/IQueryParams';
import { stringify } from 'querystring';
import { ILoginResponse } from 'domain/ILoginResponse';

@autoinject
export class BaseService<TEntity> {
    private authHeaders = {
        'Authorization': 'Bearer '
    }

    constructor(protected apiEndpointUrl: string, protected httpClient: HttpClient) {
    }

    async getAll(queryParams?: IQueryParams): Promise<IFetchResponse<TEntity[]>> {
        let url = this.apiEndpointUrl;
        if (queryParams !== undefined) {
            const params = [] as string[];
            Object.keys(queryParams).forEach(key => {
                params.push(key + '=' + queryParams[key]);
            })

            if (params.length > 0) {
                url = url + '?' + params.join('&');
            }
        }
        try {
            const response = await this.httpClient
                .fetch(url, {
                    cache: "no-store",
                    // headers: this.authHeaders
                });
            // happy case
            if (response.ok) {
                const data = (await response.json()) as TEntity[];
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

    async get(id: string): Promise<IFetchResponse<TEntity>> {
        try {
            const response = await this.httpClient
                .fetch(this.apiEndpointUrl + '/' + id, {
                    cache: "no-store",
                    // headers: this.authHeaders
                });
            // happy case
            if (response.ok) {
                const data = (await response.json()) as TEntity;
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

    async post(obj: any): Promise<IFetchResponse<TEntity>> {
        try {
            const response = await this.httpClient
                .post(this.apiEndpointUrl, JSON.stringify(obj), {
                    cache: 'no-store'
                });

            // happy case
            if (response.status >= 200 && response.status < 300) {
                const data = (await response.json()) as TEntity;
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
        }
        catch (reason) {
            return {
                statusCode: 0,
                errorMessage: JSON.stringify(reason)
            }
        }
    }



}
