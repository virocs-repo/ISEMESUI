import { Component, OnInit, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { MESSAGES,ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

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
  viewMode: boolean = false;
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
  public checkinoutData: any = {};
  public searchTerm: string = '';
  public columnData: any[] = [
    { field: 'customerLotNumber', title: 'Customer LotNumber'},
    { field: 'lotNum', title: 'Lot#/Serial#' },
    { field: 'customerName', title: 'Customer Name' },
    { field: 'device', title: 'Device' },
    { field: 'currentLocation', title: 'Current Location' },
    { field: 'inventoryStatus', title: 'Inventory Status'},
    { field: 'qty', title: 'Qty' },
    { field: 'wipLocation', title: 'WIP Location' },
    { field: 'receivedFromCheckOut', title: 'Received From/CheckOut To' },
    { field: 'area', title: 'Area' },
    { field: 'systemCheckInOutPerson', title: 'System CheckIn/Out Person' },
    { field: 'checkInOutTime', title: 'CheckIn/Out Time' }
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

  rowActionMenu: MenuItem[] = [
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
  ];

  constructor(public appService: AppService, private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.loadGridData();
  }

  loadGridData() {

     // Pass Date objects directly
     const from_date = this.fromDate ?? undefined;
     const to_date = this.toDate ?? undefined;
    
     this.apiService.getAllInventoryCheckinCheckoutStatusWithDates(from_date, to_date).subscribe({
         next: (v: any) => {
    /*          this.gridDataResult.data = v;
             this.gridDataResult.total = v.length; */
             this.originalData = v;
             this.pageData();
         },
         error: (error: any) => {
             console.error('Error fetching CombinationLots', error);
         }
     });
  }



  onSearch(): void {
    // Pass Date objects directly
    const from_date = this.fromDate ?? undefined;
    const to_date = this.toDate ?? undefined;
   
    this.apiService.getAllInventoryCheckinCheckoutStatusWithDates(from_date, to_date).subscribe({
        next: (v: any) => {
   /*          this.gridDataResult.data = v;
            this.gridDataResult.total = v.length; */
            this.originalData = v;
            this.pageData();
        },
        error: (error: any) => {
            console.error('Error fetching CombinationLots', error);
        }
    });
   
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
  onCellContextMenu(event: MouseEvent, dataItem: any, rowIndex: number): void {
    event.preventDefault();
    this.dataItemSelected = dataItem;
    this.selectedRowIndex = rowIndex;
    this.gridContextMenu.show({ left: event.pageX, top: event.pageY });
  }
  
  onCellClick(e: CellClickEvent): void {
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
    switch (e.item.text) {
      case 'View Data':
        this.appService.sharedData.anotherShipping.dataItem = dataItem
        this.appService.sharedData.anotherShipping.isEditMode = false;
        this.appService.sharedData.anotherShipping.isViewMode = true;
        this.checkinoutData = { ...dataItem };
        this.viewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.anotherShipping.dataItem = dataItem
        this.appService.sharedData.anotherShipping.isEditMode = true;
        this.appService.sharedData.anotherShipping.isViewMode = false;
        this.checkinoutData = { ...dataItem };
        this.viewMode = false;
        // access the same in receipt component
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

  
  onSearchMaster(): void {
    this.skip = 0;  // Reset pagination when searching
    this.pageData();  // Apply search and pagination
  }
  
  pageData(): void {
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
  onRecordUpdated(updatedRecord: any) {
    this.originalData = this.originalData.filter(item => item.lotNum !== updatedRecord.lotNum);
    this.originalData.unshift(updatedRecord);
    this.pageData();
  }
}
