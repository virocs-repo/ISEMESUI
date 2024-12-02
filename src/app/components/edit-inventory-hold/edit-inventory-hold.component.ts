import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ICON } from 'src/app/services/app.interface';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-edit-inventory-hold',
  templateUrl: './edit-inventory-hold.component.html',
  styleUrls: ['./edit-inventory-hold.component.scss']
})
export class EditInventoryHoldComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Input() selectedRowData: any;
  
  gridDataResult: GridDataResult = { data: [], total: 0 };
  readonly ICON = ICON;
  public selectedLocation: number = 0;
  public selectedLotNumber: string = '';
  public pageSize = 10;
  public skip = 0;
  public numberOfHolds: number = 0;
  public columnData = [
    { field: 'holdType', title: 'Hold Type' },
    { field: 'holdCode', title: 'Hold Code' },
    { field: 'holdComments', title: 'Hold Comments' },
    { field: 'holdDate', title: 'Hold Date' },
    { field: 'offHoldComments', title: 'Off Hold Comments' },
    { field: 'offHoldDate', title: 'Off Hold Date' },
    { field: 'holdBy', title: 'Hold By' },
    { field: 'offHoldBy', title: 'Off Hold By' }
  ];

  isDialogOpen = false;
  selectableSettings: any = {
    checkboxOnly: true,
    mode: 'single',
  }

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (this.selectedRowData) {
      this.loadHoldData(this.selectedRowData.inventoryId);
    }
  }

  openDialog(): void {
    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
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

  onCellClick(e: CellClickEvent): void {
    this.selectedRowData = e.dataItem;
    this.openDialog();
  }

  rowCallback = (context: any) => ({
    'highlighted-row': context.dataItem === this.selectedRowData
  });
}