import { Component } from '@angular/core';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Receipt, ICON, MESSAGES } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-receiving',
  templateUrl: './receiving.component.html',
  styleUrls: ['./receiving.component.scss']
})
export class ReceivingComponent {
  readonly ICON = ICON;
  public pageSize = 5;
  public skip = 2;
  public receipts: Receipt[] = [];
  // public gridData: Receipt[] = [];
  public data: GridDataResult = { data: [], total: 0 };

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

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
    this.fetchdata(); // because there might be changes from dialog
  }

  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchdata();
  }
  private fetchdata() {
    this.apiService.getReceiptdata().subscribe({
      next: (v: any) => {
        this.receipts = v;
        this.data.data = this.receipts;
        this.data.total = this.receipts.length
        console.log(v);
      },
      error: (v: any) => { }
    });
  }
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    console.log(event);
    this.fetchdata();
  }
  rowActionMenu: MenuItem[] = [
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Edit Data', icon: 'edit', disabled: !this.isEditButtonEnabled, svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
    { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
  ];
  doTestEditMode() {
    this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.receipts[0]);
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent, dataItem: Receipt) {
    console.log(e);
    console.log(dataItem);
    dataItem.holdComments = dataItem.holdComments || '';
    switch (e.item.text) {
      case 'Void Data':
        const body = {
          receiptDetails: [
            { ...dataItem, recordStatus: "U", loginId: this.appService.loginId, active: false }
          ]
        };
        // temp fix
        if (body.receiptDetails[0].receivingStutus) {
          body.receiptDetails[0].receivingStatus = body.receiptDetails[0].receivingStutus;
        }
        this.apiService.postProcessReceipt(body).subscribe({
          next: (value) => {
            console.log(value);
            this.appService.successMessage(MESSAGES.DataSaved);
          },
          error: (err) => {
            console.log(err);
            this.appService.errorMessage(MESSAGES.DataSaveError);
          },
        })
        break;
      case 'View Data':
        this.appService.sharedData.receiving.dataItem = dataItem
        this.appService.sharedData.receiving.isEditMode = false;
        this.appService.sharedData.receiving.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.receiving.dataItem = dataItem
        this.appService.sharedData.receiving.isEditMode = true;
        this.appService.sharedData.receiving.isViewMode = false;
        // access the same in receipt component
        this.openDialog()
        break;

      default:
        break;
    }

  }
}
