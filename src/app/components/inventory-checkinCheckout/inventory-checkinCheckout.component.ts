import { Component, OnInit, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-inventory-checkinCheckout',
  templateUrl: './inventory-checkinCheckout.component.html',
  styleUrls: ['./inventory-checkinCheckout.component.scss']
})
export class InventorycheckinCheckoutComponent implements OnInit{
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  readonly ICON = ICON
  public pageSize = 25;
  public skip = 0;
  private originalData: any[] = []; 
 selectedRowIndex: number = -1;
 format: string = 'yyyy-MM-dd'; 
  fromDate: Date | null = null;
  toDate: Date | null = null;
 public selectedRowData: any;
   public gridDataResult: GridDataResult = { data: [], total: 0 };
  public gridFilter: any = {
    logic: 'and', 
    filters: []
  };
  isEditButtonEnabled: boolean=true;
  public searchTerm: string = '';
  public columnData: any[] = [
    { field: 'lotNum', title: 'Lot#/Serial#' },
    { field: 'qty', title: 'Qty' },
    { field: 'area', title: 'Area' },
    { field: 'wipLocation', title: 'WIP Location' },
    { field: 'customerName', title: 'Customer Name' },
    { field: 'device', title: 'Device' },
    { field: 'receivedFromCheckOut', title: 'Received From/CheckOut' },
    { field: 'checkInOutTime', title: 'CheckIn/Out Time' },
    { field: 'systemCheckInOutPerson', title: 'System CheckIn/Out Person' },
    { field: 'currentLocation', title: 'Current Location' }
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

  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.loadGridData();
  }

  loadGridData() {

    this.apiService.getAllInventoryCheckinCheckoutStatus().subscribe({
      next: (v: any) => {
        this.originalData = v;
        this.pageData();
        console.log(v);
      },
      error: (v: any) => { }
    });
  }



  onSearch(): void {
    this.skip = 0;
    this.pageData();
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.pageData();
  }

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
    this.loadGridData();

  }
  dataItemSelected:any;
  onCellClick(e: CellClickEvent): void {
    if (e.type === 'contextmenu') {
      const originalEvent = e.originalEvent;
      originalEvent.preventDefault();
      this.dataItemSelected = e.dataItem;
      this.selectedRowIndex = e.rowIndex;
      this.gridContextMenu.show({ left: originalEvent.pageX, top: originalEvent.pageY });
    }
  }

  onSelectRowActionMenu(e: ContextMenuSelectEvent): void {
  }

  rowCallback = (context: any) => {
    return {
      'highlighted-row': context.index === this.selectedRowIndex
    };
  }

  
  onSearchMaster(): void {
    this.skip = 0;  // Reset pagination when searching
    this.pageData();  // Apply search and pagination
  }
  
  pageData(): void {
    /*    const filteredData = this.searchTerm ? this.filterData(this.gridDataResult.data) : this.gridDataResult.data;
   
       // Paginate the data
       const paginatedData = filteredData.slice(this.skip, this.skip + this.pageSize);
       this.gridDataResult.data = paginatedData;
           this.gridDataResult.total =filteredData.length ; */
   
           const filteredData = this.filterData(this.originalData);
       const paginatedData = filteredData.slice(this.skip, this.skip + this.pageSize);
       this.gridDataResult.data = filteredData;
       this.gridDataResult.total = filteredData.length; 
   
      
   
      
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
}
