import { Component } from '@angular/core';
import { ColumnMenuSettings, SelectableSettings } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-add-shipping',
  templateUrl: './add-shipping.component.html',
  styleUrls: ['./add-shipping.component.scss']
})
export class AddShippingComponent {
  public selectedValues: string = "";
  public listItems: Array<string> = [
    "Baseball",
    "Basketball",
    "Cricket",
    "Field Hockey",
    "Football",
    "Table Tennis",
    "Tennis",
    "Volleyball",
  ];
  gridData4 = [
    {
      lot: 'LT453454',
      Location: 'Shelf 10',
      Person: 'Peter',
      Qty: 100,
      SystemUser: 'Eswar',
      Status: 'Checked In'
    },
    {
      lot: 'LT453465',
      Location: 'Shelf 09',
      Person: 'John',
      Qty: 100,
      SystemUser: 'surya',
      Status: 'Checked Out'
    },
    {
      lot: 'LT453476',
      Location: 'Shelf 08',
      Person: 'Sam',
      Qty: 100,
      SystemUser: 'Eswar',
      Status: 'Checked In'
    },
    {
      lot: 'LT453487',
      Location: 'Shelf 07',
      Person: 'Peter',
      Qty: 100,
      SystemUser: 'surya',
      Status: 'Checked Out'
    },
  ];

  selectableSettings: SelectableSettings = {
    checkboxOnly: true,
    mode: 'multiple'
  }
  columnMenuSettings: ColumnMenuSettings = {
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

  public expectedDateTime: Date = new Date();
  public format = "MM/dd/yyyy HH:mm";
}
