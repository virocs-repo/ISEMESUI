import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ICON } from 'src/app/services/app.interface';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-edit-inventory-hold',
  templateUrl: './edit-inventory-hold.component.html',
  styleUrls: ['./edit-inventory-hold.component.scss'],
  standalone: false
})
export class EditInventoryHoldComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Input() selectedRowData: any;
  @Input() viewOrEdit: string = ''; 
  selectedRowDat:any;
  gridDataResult: GridDataResult = { data: [], total: 0 };
  readonly ICON = ICON;
  public selectedLocation: number = 0;
  public selectedLotNumber: string = '';
  public pageSize = 10;
  public skip = 0;
  public gridData: any[] = [];
  public numberOfHolds: number = 0;
  customerName: string = '';
  device: string = '';
  editholdDate : string ='';
  public columnData = [
    { field: 'holdCode', title: 'Code' },
    { field: 'reason', title: 'Reason' },
    { field: 'holdComments', title: 'Hold Comments' },
    { field: 'offHoldComments', title: 'Off Hold Comments' },
    { field: 'holdBy', title: 'Hold By' },
    { field: 'holdDate', title: 'Hold Date' },
    { field: 'offHoldBy', title: 'Off Hold By' },
    { field: 'offHoldDate', title: 'Off Hold Date' },
    { field: 'onHold', title: 'On Hold'}
  ];

  isDialogOpen = false;
  selectableSettings: any = {
    checkboxOnly: true,
    mode: 'single',
  }
  viewOrEdits: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getInventoryDetails(this.selectedRowData.inventoryID);
    if (this.selectedRowData) {
      this.loadHoldData(this.selectedRowData.inventoryID);
    }
  }
  
  openEditDialog(dataItem: any): void {
    this.apiService.getHoldDetails(dataItem.inventoryXHoldId).subscribe({
      next: (data) => {
        console.log('Fetched data:', data); 
        this.selectedRowDat = data; 
        this.viewOrEdits = 'edit';
        this.isDialogOpen = true; 
      },
      error: (err) => console.error('Failed to fetch hold details:', err)
    });
  }

  openViewDialog(dataItem: any): void {
    this.apiService.getHoldDetails(dataItem.inventoryXHoldId).subscribe({
      next: (data) => {
        console.log('Fetched data for view:', data); 
        this.selectedRowDat = data; 
        this.viewOrEdits = 'view';
        this.isDialogOpen = true; 
      },
      error: (err) => console.error('Failed to fetch hold details for view:', err)
    });
  }
  

  getInventoryDetails(inventoryID: number): void {
    this.apiService.getCustomerDetails(inventoryID).subscribe({
      next: (data: any) => {
        this.customerName = data[0].customerName;
        this.device = data[0].device;
        this.editholdDate = data[0].holdTime;
      },
      error: (err) => {
        console.error('Error fetching inventory details', err);
      }
    });
  }

  columnMenuSettings: any = {
    lock: false,
    stick: false,
    setColumnPosition: { expanded: true },
    autoSizeColumn: true,
    autoSizeAllColumns: true,
  }

  openDialog(): void {
    this.isDialogOpen = true;
    this.selectedRowDat = null;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedRowData) {
      const inventoryId = this.selectedRowData?.inventoryID;
      if (inventoryId) {
        this.loadHoldData(inventoryId);
      }
    }
    if (changes['selectedRowData'] && this.selectedRowData) {
      this.selectedLotNumber = this.selectedRowData.iseLotNumber || '';
      this.selectedLocation = this.selectedRowData.location || '';
      this.filterGridData();
    }
  }
  filterGridData(): void {
    if (this.selectedLotNumber && this.selectedLocation) {
      this.gridDataResult.data = this.gridData.filter(item =>
        item.lotNum === this.selectedLotNumber && item.location === this.selectedLocation
      );
      this.gridDataResult.total = this.gridDataResult.data.length;
    } else {
      this.gridDataResult.data = [...this.gridData];
      this.gridDataResult.total = this.gridData.length;
    }
    this.numberOfHolds = this.gridDataResult.data.length; 
  }
  clearRequest(): void {
    this.gridDataResult = { data: [], total: 0 };
    this.selectedLocation = 0;
    this.selectedLotNumber = '';
    this.cancel.emit();
  }

  loadHoldData(inventoryId: number): void {
    this.apiService.getAllHolds(inventoryId).subscribe({
      next: (data: any) => {
        this.gridDataResult.data = data;
        this.gridDataResult.total = data.length;
        this.numberOfHolds = data.length;
      },
      error: () => {}
    });
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
  }

  rowCallback = (context: any) => ({
    'highlighted-row': context.dataItem === this.selectedRowData
  });
  onDataUpdated(): void {
    if (this.selectedRowData?.inventoryID) {
      this.loadHoldData(this.selectedRowData.inventoryID);
    }
  }
  onAddClick()  {
    this.viewOrEdits = '';
    this.openDialog();
  }
}
