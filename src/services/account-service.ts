import { ILoginResponse } from './../domain/ILoginResponse';
import { autoinject } from 'aurelia-framework';
import { BaseService } from './base-service';
import { HttpClient } from 'aurelia-fetch-client';

@autoinject
export class AccountService extends BaseService<ILoginResponse> {

    constructor(protected httpClient: HttpClient) {
        super('Account/Login', httpClient);
    }
}
