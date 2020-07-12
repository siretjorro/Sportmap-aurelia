import { autoinject } from "aurelia-framework";
import { DialogController } from 'aurelia-dialog';

@autoinject
export class Confirm {

    constructor(public controller: DialogController) {

    }

    message = "";

    activate(data: string): void {
        this.message = data;
    }
}
