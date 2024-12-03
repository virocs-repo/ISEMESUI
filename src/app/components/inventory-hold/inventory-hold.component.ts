import { Component, OnInit, ViewChild } from "@angular/core";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { ContextMenuComponent, ContextMenuSelectEvent } from "@progress/kendo-angular-menu";
import { ApiService } from "src/app/services/api.service";
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-inventory-hold',
  templateUrl: './inventory-hold.component.html',
  styleUrls: ['./inventory-hold.component.scss']
})
export class InventoryHoldComponent implements OnInit {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  readonly ICON = ICON
  public pageSize = 10;
  public skip = 0;
  private originalData: any[] = [];
  public isEditMode: boolean = true;
  public searchTerm: string = '';
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  public columnData: any[] = [
    { field: 'lotNum', title: 'Lot#/Serial#' },
    { field: 'location', title: 'Location' },
    { field: 'person', title: 'Person' },
    { field: 'qty', title: 'Qty' },
    { field: 'systemUser', title: 'System User' },
    { field: 'goodsType', title: 'Goods Type' },
    { field: 'status', title: 'Status' },
  ];
  public rowActionMenu: any[] = [
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon }
  ];
  public isDialogOpen = false;
  public holdData: any = {};
  public selectedRowIndex: number = -1;
  public dataItemSelected: any;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadGridData();
  }

  loadGridData(): void {
    this.apiService.getAllInventoryMoveStatus().subscribe({
      next: (data: any) => {
        this.originalData = data;
        this.pageData();
      },
      error: () => { }
    });
  }

  pageData(): void {
    const filteredData = this.filterData(this.originalData);
    const paginatedData = filteredData.slice(this.skip, this.skip + this.pageSize);
    this.gridDataResult.data = filteredData;
    this.gridDataResult.total = filteredData.length; 
    }

  filterData(data: any[]): any[] {
    if (!this.searchTerm) return data;
    const term = this.searchTerm.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(term))
    );
  }

  onSearch(): void {
    this.skip = 0;
    this.pageData();
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.pageData();
  }
  openDialog() {
    this.isDialogOpen = true;
  }
  onCellClick(event: any): void {
    const originalEvent = event.originalEvent;
    originalEvent.preventDefault();
    this.dataItemSelected = event.dataItem;
    this.selectedRowIndex = event.rowIndex;
    this.gridContextMenu.show({ left: originalEvent.pageX, top: originalEvent.pageY });
  }

  onSelectRowActionMenu(e: ContextMenuSelectEvent): void {
    const dataItem = this.dataItemSelected;
    switch (e.item.text) {
        case 'View Data':
            this.isEditMode = false;
            this.holdData = { ...dataItem };
            this.openDialog();
            break;
        case 'Edit Data':
            this.isEditMode = true; 
            this.holdData = { ...dataItem };
            this.openDialog();
            break;
        default:
            break;
    }
}

  closeDialog(): void {
    this.isDialogOpen = false;
    this.loadGridData();
  }
}