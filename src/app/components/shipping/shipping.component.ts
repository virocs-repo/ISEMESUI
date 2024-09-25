import { Component, ViewChild } from '@angular/core';
import { CellClickEvent, ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { ICON, MESSAGES, Receipt } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent {
  readonly ICON = ICON;
  gridDataResult: GridDataResult = { data: [], total: 0 };
  public pageSize = 10;
  public skip = 0;
  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchdata();
  }
  private fetchdata() {
    this.apiService.getShippingData().subscribe({
      next: (v: any) => {
        this.gridDataResult.data = v;
        this.gridDataResult.total = v.length
        console.log(v);
      },
      error: (v: any) => { }
    });
    if (this.appService.shipmentCategories.length) {
    } else {
      this.apiService.getShipmentCategories().subscribe({
        next: (shipmentCategories: any) => {
          this.appService.shipmentCategories = shipmentCategories;
          console.log({ shipmentCategories });
        },
        error: (v: any) => { }
      })
    }
    if (this.appService.shipmentTypes.length) {
    } else {
      this.apiService.getShipmentTypes().subscribe({
        next: (shipmentTypes: any) => {
          this.appService.shipmentTypes = shipmentTypes;
          console.log({ shipmentTypes });
        },
        error: (v: any) => { }
      })
    }
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    console.log(event);
    this.fetchdata();
  }
  gridData4 = [
    {
      lot: 'LT453454',
      Location: 'Shelf 10',
      Person: 'Peter',
      Qty: 100,
      SystemUser: 'Eswar',
      Status: 'Checked In'
    },
    {
      lot: 'LT453465',
      Location: 'Shelf 09',
      Person: 'John',
      Qty: 100,
      SystemUser: 'surya',
      Status: 'Checked Out'
    },
    {
      lot: 'LT453476',
      Location: 'Shelf 08',
      Person: 'Sam',
      Qty: 100,
      SystemUser: 'Eswar',
      Status: 'Checked In'
    },
    {
      lot: 'LT453487',
      Location: 'Shelf 07',
      Person: 'Peter',
      Qty: 100,
      SystemUser: 'surya',
      Status: 'Checked Out'
    },
  ];

  selectableSettings: SelectableSettings = {
    checkboxOnly: true,
    mode: 'multiple'
  }
  columnMenuSettings: ColumnMenuSettings = {
    lock: false,
    stick: false,
    setColumnPosition: { expanded: true },
    autoSizeColumn: true,
    autoSizeAllColumns: true,
  }
  public items: any[] = [
    { text: 'Item1', icon: 'edit' },
    { text: 'Item2', icon: 'delete' },
    { text: 'Item3', icon: 'copy' }
  ];

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }

  doTestEditMode() {
    // this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.gridData[0]);
  }

  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  rowActionMenu: MenuItem[] = [
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
  ];
  dataItemSelected!: Receipt;
  selectedRowIndex: number = -1;
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
    dataItem.holdComments = dataItem.holdComments || '';
    switch (e.item.text) {
      case 'View Data':
        this.appService.sharedData.shipping.dataItem = dataItem
        this.appService.sharedData.shipping.isEditMode = false;
        this.appService.sharedData.shipping.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.shipping.dataItem = dataItem
        this.appService.sharedData.shipping.isEditMode = true;
        this.appService.sharedData.shipping.isViewMode = false;
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
}
