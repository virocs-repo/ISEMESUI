import { Component } from '@angular/core';
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order.component.html',
  styleUrls: ['./customer-order.component.scss']
})
export class CustomerOrderComponent {
  readonly ICON = ICON
  columnData = [
    { title: "ISE Lot#", field: 'ISELot' },
    { title: "Customer Lot#", field: 'CustomerLot' },
    { title: "Qty", field: 'Qty' },
    { title: "Expedite", field: 'Expedite' },
    { title: "Part #", field: 'Part' },
    { title: "Unprocessed", field: 'Unprocessed' },
    { title: "Good", field: 'Good' },
    { title: "Reject", field: 'Reject' },
    { title: "COO", field: 'COO' },
    { title: "Date Code", field: 'DateCode' },
    { title: "FG Part #", field: 'FGPart' },
    { title: "Status", field: 'Status' },
  ]
  public gridData = [
    {
      ISELot: 'ASAB3156165',
      CustomerLot: 'Shelf 10',
      Qty: 100,
      Expedite: 'Peter',
      Part: '100',
      Unprocessed: '100',
      Good: '0',
      Reject: 'Eswar',
      COO: 'CN',
      DateCode: 1464,
      FGPart: 'Bluetooth',
      Status: 'Checked In'
    },
    {
      ISELot: 'LT453465',
      CustomerLot: 'Shelf 09',
      Qty: 100,
      Expedite: 'John',
      Part: '100',
      Unprocessed: '100',
      Good: '0',
      Reject: 'surya',
      COO: 'TN',
      DateCode: 8411,
      FGPart: 'wifi',
      Status: 'Checked Out'
    },
    {
      ISELot: 'LT453476',
      CustomerLot: 'Shelf 08',
      Qty: 100,
      Expedite: 'Sam',
      Part: '100',
      Unprocessed: '100',
      Good: '0',
      Reject: 'Eswar',
      COO: 'CN',
      DateCode: 1464,
      FGPart: 'Bluetooth',
      Status: 'Checked In'
    },
    {
      ISELot: 'LT453487',
      CustomerLot: 'Shelf 07',
      Qty: 100,
      Expedite: 'Peter',
      Part: '100',
      Unprocessed: '100',
      Good: '0',
      Reject: 'Eswar',
      COO: 'CN',
      DateCode: 1464,
      FGPart: 'Bluetooth',
      Status: 'Checked In'
    },
  ];
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
    { text: 'View Data', icon: 'eye' },
    { text: 'Export Data', icon: 'export' }
  ];


  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
