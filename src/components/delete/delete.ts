import { autoinject, bindable } from "aurelia-framework";
import { DialogService } from "aurelia-dialog";
import { Confirm } from 'components/confirm/confirm';

@autoinject
export class Delete {

    @bindable
    action = function (): void {
        // do nothing
    };

    @bindable
    msg = "Are you sure";

    constructor(public dlg: DialogService) {

    }

    do(): void {
        this.dlg.open({
            viewModel: Confirm
            , model: this.msg
        }).whenClosed().then(result => {
            if (result.wasCancelled) return;
            this.action();
        });
    }
}
