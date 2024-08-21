import { Component } from '@angular/core';
import { eyeIcon, folderIcon, pencilIcon, SVGIcon } from '@progress/kendo-svg-icons';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  columnData = [
    { title: "ISE Lot#", field: 'lot', isLink: true },
    { title: "Receipt #", field: 'Location', isLink: true },
    { title: "Qty", field: 'Qty' },
    { title: "Expedite", field: 'Person' },
    { title: "Part #", field: 'SystemUser' },
    { title: "Unprocessed", field: 'Status' },
    { title: "Good", field: 'Good' },
    { title: "Reject", field: 'Reject' },
    { title: "COO", field: 'Status' },
    { title: "Date Code", field: 'Status' },
    { title: "FG Part #", field: 'Status' },
    { title: "Status", field: 'Status' },
    // { title: "Hold", field: 'Status' }
  ]
  public gridData = [
    {
      lot: 'ASAB3156165',
      Location: 'Shelf 10',
      Person: 'Peter',
      Qty: 100,
      Good: 100,
      Reject: 0,
      SystemUser: 'Eswar',
      Status: 'Checked In'
    },
    {
      lot: 'LT453465',
      Location: 'Shelf 09',
      Person: 'John',
      Qty: 100,
      Good: 100,
      Reject: 0,
      SystemUser: 'surya',
      Status: 'Checked Out'
    },
    {
      lot: 'LT453476',
      Location: 'Shelf 08',
      Person: 'Sam',
      Qty: 100,
      Good: 100,
      Reject: 0,
      SystemUser: 'Eswar',
      Status: 'Checked In'
    },
    {
      lot: 'LT453487',
      Location: 'Shelf 07',
      Person: 'Peter',
      Qty: 100,
      Good: 100,
      Reject: 0,
      SystemUser: 'surya',
      Status: 'Checked Out'
    }
  ]
  selectableSettings: any = {
    checkboxOnly: true,
    mode: 'single',
  }
  columnMenuSettings: any = {
    lock: false,
    stick: false,
    setColumnPosition: { expanded: true },
    autoSizeColumn: true,
    autoSizeAllColumns: true,
  }
  public items: any[] = [
    { text: 'Item1', icon: 'edit' },
    { text: 'Item2', icon: 'delete' },
    { text: 'Item3', icon: 'copy' }
  ];

  isDialogOpen1 = false;
  isDialogOpen2 = false;
  isDialogOpen3 = false;

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }
  public eyeIcon: SVGIcon = eyeIcon;
  public pencilIcon: SVGIcon = pencilIcon;
  public onButtonClick(): void {
    console.log("click");
    this.isDialogOpen1 = !this.isDialogOpen1
  }
  onCellClick(event: any): void {
    console.log(event);
    switch (event.columnIndex) {
      case 1:
        this.openDialog();
        break;
      case 2:
        this.isDialogOpen3 = !this.isDialogOpen3
        break;

      default:
        break;
    }
  }
}
