import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { ITrack } from 'domain/ITrack';
import { TrackService } from 'services/track-service';

@autoinject
export class TrackCreate {
  private _track!: ITrack;

  constructor(private trackService: TrackService, private router: Router) {
  }

  async newTrack(): Promise<void> {
    await this.trackService.post(this._track);
    this.router.navigate('tracks');
  }
}
