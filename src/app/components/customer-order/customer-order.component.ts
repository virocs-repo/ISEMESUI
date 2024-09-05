import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order.component.html',
  styleUrls: ['./customer-order.component.scss']
})
export class CustomerOrderComponent implements OnInit {
  /* columnData = [
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
  ]; */

  public gridData: any[] = [];
  public filteredGridData: any[] = [];
  public searchTerm: string = '';
  public columnData: any[] = [
/*     { field: 'customerOrderID', title: 'Customer Order ID' },
    { field: 'customerOrderDetailID', title: 'Customer Order Detail ID' },
    { field: 'customerId', title: 'Customer ID' },
    { field: 'customerName', title: 'Customer Name' },
    { field: 'goodsType', title: 'Goods Type' },
    { field: 'inventoryID', title: 'Inventory ID' },
    { field: 'hardwareType', title: 'Hardware Type' }, */
    { field: 'iseLotNum', title: 'ISE Lot Number' },
    { field: 'customerLotNum', title: 'Customer Lot Number' },
    { field: 'shippedQty', title: 'Shipped Quantity' },
    { field: 'expedite', title: 'Expedite' },
    { field: 'partNum', title: 'Part Number' },
    { field: 'unprocessed', title: 'Unprocessed' },
    { field: 'good', title: 'Good' },
    { field: 'reject', title: 'Reject' },
    { field: 'coo', title: 'Country of Origin (COO)' },
    { field: 'dateCode', title: 'Date Code' },
    { field: 'fgPartNum', title: 'FG Part Number' },
    { field: 'orderStatus', title: 'Order Status' }
    // { field: 'createdOn', title: 'Created On' },
    // { field: 'modifiedOn', title: 'Modified On' }
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGridData();
  }

  loadGridData(): void {
    this.http.get<any[]>('https://localhost:44303/api/v1/ise/inventory/customer/getallorder')
      .subscribe((data) => {
        this.gridData = data;
        this.filteredGridData = data;  // Initialize with full data
      });
  }


  onSearch(): void {
    if (this.searchTerm) {
      this.filteredGridData = this.gridData.filter(item => {
        return Object.values(item).some(val => {
          return String(val).toLowerCase().includes(this.searchTerm.toLowerCase());
        });
      });
    } else {
      this.filteredGridData = this.gridData;  // Reset to full data if no search term
    }
  }
}
