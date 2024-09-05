import { Component } from '@angular/core';
import { eyeIcon, pencilIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-onoff-hold',
  templateUrl: './onoff-hold.component.html',
  styleUrls: ['./onoff-hold.component.scss']
})
export class OnoffHoldComponent {
  readonly ICON = ICON
  columnData = [
    { title: "Code", field: 'Code' },
    { title: "Reason", field: 'Reason' },
    { title: "Source", field: 'Source' },
    { title: "On Hold?", field: 'OnHold' },
    { title: "Hold Time", field: 'HoldTime' },
    { title: "Hold By", field: 'HoldBy' },
    { title: "Off Hold Time", field: 'OffHoldTime' },
    { title: "Off Hold By", field: 'OffHoldBy' },
    { title: "Comments", field: 'Comments' },
    // { title: "Action", field: 'Action' },
  ]
  gridData = [
    {
      Code: 'ASAB3156165',
      Reason: 'Shelf 10',
      Source: 'Peter',
      OnHold: 'Yes',
      HoldTime: '100',
      HoldBy: '100',
      OffHoldTime: '0',
      OffHoldBy: 'Eswar',
      Comments: 'Checked In'
    },
    {
      Code: 'LT453465',
      Reason: 'Shelf 09',
      Source: 'John',
      OnHold: 'Yes',
      HoldTime: '100',
      HoldBy: '100',
      OffHoldTime: '0',
      OffHoldBy: 'surya',
      Comments: 'Checked Out'
    },
    {
      Code: 'LT453476',
      Reason: 'Shelf 08',
      Source: 'Sam',
      OnHold: 'Yes',
      HoldTime: '100',
      HoldBy: '100',
      OffHoldTime: '0',
      OffHoldBy: 'Eswar',
      Comments: 'Checked In'
    },
    {
      Code: 'LT453487',
      Reason: 'Shelf 07',
      Source: 'Peter',
      OnHold: 'Yes',
      HoldTime: '100',
      HoldBy: '100',
      OffHoldTime: '0',
      OffHoldBy: 'Eswar',
      Comments: 'Checked In'
    }
  ]
  public eyeIcon: SVGIcon = eyeIcon;
  public pencilIcon: SVGIcon = pencilIcon;
  public onButtonClick(): void {
    console.log("click");
    this.isDialogOpen2 = !this.isDialogOpen2;
  }
  onCellClick(event: any): void {
    console.log(event);
    switch (event.columnIndex) {
      case 1:
        // this.openDialog();
        break;
      case 2:
        // this.isDialogOpen3 = !this.isDialogOpen3
        break;

      default:
        break;
    }
  }
  isDialogOpen2 = false;
  isDialogOpen3 = false;

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }
}
