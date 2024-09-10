import { Component } from '@angular/core';
import { ColumnMenuSettings, GridDataResult, SelectableSettings } from '@progress/kendo-angular-grid';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { ICON, Receipt } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent {
  readonly ICON = ICON;
  gridDataResult: GridDataResult = { data: [], total: 0 };

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

  rowActionMenu: MenuItem[] = [
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
    { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
  ];
  doTestEditMode() {
    // this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.gridData[0]);
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent, dataItem: Receipt) {
    console.log(e);
    console.log(dataItem);
    dataItem.holdComments = dataItem.holdComments || '';
    switch (e.item.text) {
      case 'Void Data':
        break;
      case 'View Data':
        break;
      case 'Edit Data':
        break;

      default:
        break;
    }

  }
}
