import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { process, State } from '@progress/kendo-data-query';  // For Kendo filtering

@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order.component.html',
  styleUrls: ['./customer-order.component.scss']
})
export class CustomerOrderComponent implements OnInit {

  public gridData: any[] = [];
  public gridFilter: any = {
    logic: 'and',  // Filter logic (can be 'and' or 'or')
    filters: []
  };
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
  onFilterChange(event: any): void {
    this.gridFilter = event;
    this.filteredGridData = process(this.gridData, { filter: this.gridFilter }).data;  // Apply filters
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
