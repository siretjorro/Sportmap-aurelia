export class AsyncBindingBehavior {
    bind(binding: { originalupdateTarget: (arg0: any) => void; updateTarget: (a: any) => void }, source: any, busymessage: any): void {
      binding.originalupdateTarget = binding.updateTarget;
      binding.updateTarget = (a: Promise<any>): void => { 
        if (typeof a.then === 'function') {
          if (busymessage) 
            binding.originalupdateTarget(busymessage);
          a.then((d: any) => { binding.originalupdateTarget(d); });
        }
        else
          binding.originalupdateTarget(a);
       };
    }
   
    unbind(binding: { updateTarget: any; originalupdateTarget: null }): void {
      binding.updateTarget = binding.originalupdateTarget;
      binding.originalupdateTarget = null;
    }
  }
