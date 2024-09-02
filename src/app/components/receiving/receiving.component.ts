import { Component } from '@angular/core';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Receipt, ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-receiving',
  templateUrl: './receiving.component.html',
  styleUrls: ['./receiving.component.scss']
})
export class ReceivingComponent {
  readonly ICON = ICON;
  public gridData: Receipt[] = [];

  isAddButtonEnabled: boolean = this.appService.feature.find(o => o.featureName == 'Receiving Add')?.active ?? false;
  isEditButtonEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Edit")?.active ?? false;
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
  public items: MenuItem[] = [
    { text: 'Void Data', icon: 'close' },
    { text: 'Edit Data', icon: 'edit', disabled: !this.isEditButtonEnabled },
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

  constructor(private appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getReceiptdata().subscribe({
      next: (v: any) => {
        this.gridData = v;
        console.log(v);
      },
      error: (v: any) => { }
    });
  }

  selectItem(e: ContextMenuSelectEvent, dataItem: Receipt) {
    console.log(e);
    switch (e.item.text) {
      case 'View Data':
        this.appService.sharedData.receiving.dataItem = dataItem
        this.appService.sharedData.receiving.isEditMode = false;
        this.appService.sharedData.receiving.isViewMode = true;
        // access the same in receipt component
        console.log(dataItem);
        this.openDialog()
        break;

      default:
        break;
    }

  }
}
