import { Component, OnInit, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { HttpClient } from '@angular/common/http';
import { process, State } from '@progress/kendo-data-query';  // For Kendo filtering
import { environment } from 'src/environments/environment';
import { ICON } from 'src/app/services/app.interface';
import { ApiService } from 'src/app/services/api.service';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';

@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order.component.html',
  styleUrls: ['./customer-order.component.scss']
})
export class CustomerOrderComponent implements OnInit {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  public isEditMode: boolean = true;  // Default to edit mode
  readonly ICON = ICON
  public pageSize = 10;
  public skip = 0;
 selectedRowIndex: number = -1;
   public gridDataResult: GridDataResult = { data: [], total: 0 };
  public gridFilter: any = {
    logic: 'and',  // Filter logic (can be 'and' or 'or')
    filters: []
  };
  isEditButtonEnabled: boolean=true;
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
  

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadGridData();  // Reload data with pagination
  }

  rowActionMenu: MenuItem[] = [
    
    { text: 'Edit Data', icon: 'edit', disabled: !this.isEditButtonEnabled, svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
    // { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
  ];
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadGridData();
  }


  loadGridData() {

    this.apiService.getallCustomerOrder().subscribe({
      next: (v: any) => {
        // this.receipts = v;
        this.gridDataResult.data = v;
        this.gridDataResult.total = v.length
        console.log(v);
      },
      error: (v: any) => { }
    });


  }

  pageData(): void {
    const filteredData = this.searchTerm ? this.filterData(this.gridDataResult.data) : this.gridDataResult.data;

    // Paginate the data
    const paginatedData = filteredData.slice(this.skip, this.skip + this.pageSize);
    this.gridDataResult.data = paginatedData;
        this.gridDataResult.total =filteredData.length ;

   
  } 
  filterData(data: any[]): any[] {
    if (!this.searchTerm) {
      return data;
    }
    const term = this.searchTerm.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(term))
    );
  }


  onSearch(): void {
    this.skip = 0;  // Reset pagination when searching
    this.pageData();  // Apply search and pagination
  }
  dataItemSelected:any;
  onCellClick(e: CellClickEvent): void {
    console.log(e);
    if (e.type === 'contextmenu') {
      const originalEvent = e.originalEvent;
      originalEvent.preventDefault();
      this.dataItemSelected = e.dataItem;
      this.selectedRowIndex = e.rowIndex;
      this.gridContextMenu.show({ left: originalEvent.pageX, top: originalEvent.pageY });
    }
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent) {


const dataItem = this.dataItemSelected;
console.log(e);
console.log(dataItem);

switch (e.item.text) {
  
    
  case 'View Data':
    // access the same in receipt component
    this.isEditMode = false;  // Set to view mode
    this.openDialog()
    break;
  case 'Edit Data':
    // access the same in receipt component
    this.isEditMode = true;  // Set to edit mode
    this.openDialog()
    break;

  default:
    break;
}



  }
  rowCallback = (context: any) => {
    return {
      'highlighted-row': context.index === this.selectedRowIndex
    };
  }


}
