import { Component } from '@angular/core';
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-hold-details',
  templateUrl: './hold-details.component.html',
  styleUrls: ['./hold-details.component.scss']
})
export class HoldDetailsComponent {
  readonly ICON = ICON
  uploadRemoveUrl = 'https://www.syncfusion.com/downloads/support/directtrac/general/ze/UploadRemove-1530193647.zip';
  uploadSaveUrl = 'https://www.syncfusion.com/downloads/support/directtrac/general/ze/UploadSave-1530193647.zip';

}
