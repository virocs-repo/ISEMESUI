import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CellClickEvent, GridComponent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ICON } from 'src/app/services/app.interface';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-edit-inventory-hold',
  templateUrl: './edit-inventory-hold.component.html',
  styleUrls: ['./edit-inventory-hold.component.scss']
})
export class EditInventoryHoldComponent implements OnInit {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('grid', { static: true }) grid!: GridComponent; 
  @Input() selectedRowData: any;
  @Input() holdTypes: string[] = ['Receiving', 'Engineering', 'QA', 'Production'];
  private originalData: any[] = []; 
  gridDataResult: GridDataResult = { data: [], total: 0 };
  readonly ICON = ICON;
  public gridData: any[] = [];
  public selectedLocation: number = 0;
  public selectedReceivedFrom: string = '';
  public selectedLotNumber: string = '';
  public pageSize = 10;
  public skip = 0;
  public searchTerm: string = '';
  selectedRowIndex: number = -1;
  public filteredLotNumbers: Array<string> = [];
  public numberOfHolds: number = 0;
  public columnData: any[] = [
    { field: 'holdType', title: 'Hold Type' },
    { field: 'holdCode', title: 'Hold Code' },
    { field: 'holdComments', title: 'Hold Comments' },
    { field: 'holdDate', title: 'Hold Date' },
    { field: 'offHoldComments', title: 'Off HoldComments' },
    { field: 'offHoldDate', title: 'Off Hold Date' },
    { field: 'holdBy', title: 'Hold By' },
    { field: 'offHoldBy', title: 'Off Hold By' }
  ];

  isEditMode: boolean = false;
  selectedRecords: any;
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

  constructor( private apiService: ApiService) { }

  ngOnInit(): void {
    if (this.selectedRowData) {
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

  isDialogOpen = false;
  openDialog(mode: 'add' | 'edit', selectedRecord: any = null): void {
    this.isDialogOpen = true;
    if (mode === 'edit') {
      this.selectedRowData = selectedRecord;
    } else {
      this.selectedRowData = null;
    }
  }
  
  closeDialog() {
    this.isDialogOpen = false;
  }
  pageData(): void {
    const filteredData = this.filterData(this.originalData);
    this.gridDataResult.data = filteredData;
    this.gridDataResult.total = filteredData.length; 
    this.numberOfHolds = filteredData.length;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedRowData) {
      const inventoryId = this.selectedRowData?.inventoryId;
      if (inventoryId) {
        this.loadHoldData(inventoryId);
      }
    }
    if (changes['selectedRowData'] && this.selectedRowData) {
      this.selectedLotNumber = this.selectedRowData.lotNum || '';
      this.selectedLocation = this.selectedRowData.location || '';
      this.filterGridData();
    }
  }

  loadHoldData(inventoryId: number): void {
    this.apiService.getAllHolds(inventoryId).subscribe({
      next: (data: any) => {
        this.originalData = data;
        this.pageData();
        console.log(data);
      },
      error: (v: any) => { }
    });
  }

  editRow(dataItem: any): void {
    this.isEditMode = true;
    this.selectedRowData = dataItem;
    this.selectedLotNumber = dataItem.lotNum;
    this.selectedLocation = dataItem.location;
    this.selectedReceivedFrom = dataItem.receivedFrom;
    if (dataItem.lotNum) {
      this.loadHoldData(dataItem.lotNum);
    }
    if (dataItem.inventoryId) {
      this.loadHoldData(dataItem.inventoryId);
    }
  }

  onSelectionChange(event: any): void {
    const selectedData = event.selectedRows[0]?.dataItem;
    if (selectedData) {
      this.editRow(selectedData);
    }
  }

  clearRequest(): void {
    this.gridDataResult = { data: [], total: 0 };
    this.selectedLocation = 0;
    this.selectedReceivedFrom = '';
    this.selectedLotNumber = '';
    this.cancel.emit();
    this.isEditMode = false; 
    this.selectedRowData = null;
  }

  rowCallback  = (context: any) => {
    return {
      'highlighted-row': context.index === this.selectedRowIndex
    };
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.pageData();
  }
}