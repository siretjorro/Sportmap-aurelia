import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { IState } from 'state/state';
import { Store } from 'aurelia-store';
import { RegisterService } from 'services/register-service';

@autoinject
export class AccountRegister {
    private _email: string = "";
    private _password: string = "";
    private _firstName: string = "";
    private _lastName: string = "";
    // private _errorMessage: string | null = null;

    constructor(private store: Store<IState>, private registerService: RegisterService, private router: Router) {
        this.store.registerAction('stateUpdateJwt', this.stateUpdateJwt);
    }

    // ================================= View  ===============================

    onSubmit(event: Event): void {
        this.registerService.post({ email: this._email, password: this._password, firstName: this._firstName, lastName: this._lastName}).then(
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
