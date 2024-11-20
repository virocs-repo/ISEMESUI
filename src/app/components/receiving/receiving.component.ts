import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Receipt, ICON, MESSAGES, PostReceipt } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-receiving',
  templateUrl: './receiving.component.html',
  styleUrls: ['./receiving.component.scss']
})
export class ReceivingComponent implements OnDestroy{
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;

  readonly ICON = ICON;
  public pageSize = 10;
  public skip = 0;
  public gridDataResult: GridDataResult = { data: [], total: 0 };

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
   range = { start: null, end: null };


  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
    this.fetchdata(); // because there might be changes from dialog
    this.appService.eventEmitter.emit({ action: 'refreshVendors', data: { m: 'masterData' } })
  }
  readonly subscription = new Subscription()

  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchdata();
    this.subscription.add(this.appService.sharedData.receiving.eventEmitter.subscribe((v) => {
      switch (v) {
        case 'closeDialog':
          this.closeDialog();
          break;
        default:
          break;
      }
    }))
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private fetchdata() {
    this.apiService.getReceiptdata().subscribe({
      next: (v: any) => {
        this.gridDataResult.data = v;
        this.gridDataResult.total = v.length
      },
      error: (v: any) => { }
    });
  }
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.fetchdata();
  }
  rowActionMenu: MenuItem[] = [
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Edit Data', icon: 'edit', disabled: !this.isEditButtonEnabled, svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
    // { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
  ];
  doTestEditMode() {
    // this.onSelectRowActionMenuV1({ item: { text: 'Edit Data' } } as any, this.gridDataResult.data[0]);
  }
  private onSelectRowActionMenuV1(e: ContextMenuSelectEvent, dataItem: Receipt) {
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
            this.appService.successMessage(MESSAGES.DataSaved);
            this.fetchdata()
          },
          error: (err) => {
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
  dataItemSelected: Receipt | undefined;
  selectedRowIndex: number = -1;
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
    if (!dataItem) {
      console.error('Selected dataItem is not set');
      return;
    }
    dataItem.holdComments = dataItem.holdComments || '';
    switch (e.item.text) {
      case 'Void Data':
        const body = {
          receiptDetails: [
            {
              ...dataItem, recordStatus: "U", loginId: this.appService.loginId, active: false,
              expectedDateTime: this.appService.formattedDateTime2(new Date(dataItem.expectedDateTime)),
              signatureDate: this.appService.formattedDateTime2(new Date(dataItem.signatureDate)),
            }
          ]
        };
        // temp fix
        if (body.receiptDetails[0].receivingStutus) {
          body.receiptDetails[0].receivingStatus = body.receiptDetails[0].receivingStutus;
        }
        this.apiService.postProcessReceipt(body).subscribe({
          next: (value) => {
            this.appService.successMessage(MESSAGES.DataSaved);
            this.fetchdata()
          },
          error: (err) => {
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
  rowCallback = (context: any) => {
    return {
      'highlighted-row': context.index === this.selectedRowIndex
    };
  }
  onClearForm() {
    this.isDialogOpen = false;
    setTimeout(() => {
      this.isDialogOpen = true;
    }, 300);
  }
  private updatePostReceiptObject(r: Receipt) {
    const postReceipt: PostReceipt = {
      ReceiptID: r.receiptID,
      VendorID: null,
      VendorName: null,
      CustomerTypeID: 1,
      CustomerVendorID: 31,
      BehalfID: 33,
      ReceivingFacilityID: 1,
      DeliveryModeID: 3,
      CourierDetailID: null,
      CountryFromID: null,
      ContactPerson: "Amith S",
      ContactPhone: "215-634-123",
      Email: "Amith_s@xyz.com",
      ExpectedDateTime: "2024-08-27 09:28:39.187",
      AddressID: 1,
      MailComments: null,
      PMComments: null,
      NoOfCartons: 2,
      IsHold: false,
      HoldComments: null,
      IsExpected: false,
      IsInterim: false,
      IsFTZ: false,
      MailStatus: null,
      ReceivingStatus: null,
      SignaturePersonType: "Vendor",
      SignaturePersonID: 1,
      Signature: "Amithsvc",
      SignatureDate: "2024-08-27 09:28:39.187",
      RecordStatus: "I",
      Active: true,
      LoginId: 1,
      EmployeeDetail: [],
      TrackingNumber: null
    }
    return postReceipt;
  }

  private doPostProcessReceipt(postReceipt: PostReceipt) {
    const body = { ReceiptDetails: [postReceipt] }
    this.apiService.postProcessReceipt(body).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
    });
  }
  canCloseDialog() {
    this.appService.sharedData.receiving.eventEmitter.emit('canCloseDialog?')
  }
}
