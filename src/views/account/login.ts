import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { AccountService } from 'services/account-service';
import { IState } from 'state/state';
import { Store } from 'aurelia-store';

@autoinject
export class AccountLogin {
    private _email: string = "";
    private _password: string = "";
    private _errorMessage: string | null = null;

    constructor(private store: Store<IState>, private accountService: AccountService, private router: Router) {
        this.store.registerAction('stateUpdateJwt', this.stateUpdateJwt);
    }

    // ================================= View  ===============================

    onSubmit(event: Event): void {
        this.accountService.post({ email: this._email, password: this._password }).then(
            response => {
                if (response.data) {
                    this.store.dispatch(this.stateUpdateJwt, response.data.token);

                    if (this.router) {
                        this.router.navigateToRoute('home');
                    }
                }
            }
        );
    }

    // ================================= State  ===============================

    // take the old state, make shallow copy, update copy, return as new state
    stateUpdateJwt(state: IState, jwt: string): IState {
        const newState = Object.assign({}, state);
        newState.jwt = jwt;
        return newState;
    }
}
