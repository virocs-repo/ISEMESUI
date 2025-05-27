import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ActiveColorClickEvent } from '@progress/kendo-angular-inputs';
import { ContextMenuComponent, ContextMenuEvent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { PDFExportComponent } from '@progress/kendo-angular-pdf-export';
import { map, Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AppFeatureField, Country, Customer, DeviceItem, DeviceType, Employee,
  ICON, INIT_DEVICE_ITEM, JSON_Object, LotCategory, MESSAGES, PostDevice, PostReceipt, Vendor
} from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

enum ActionType {
  Remove = 'Remove',
  Receive = 'Receive',
  UndoReceive = 'Undo Receive',
  EditData = 'Edit Data',
  Hold = 'Hold',
  Print = 'Print',
  VoidData = 'Void Data'
}

@Component({
  selector: 'app-add-receiving',
  templateUrl: './add-receiving.component.html',
  styleUrls: ['./add-receiving.component.scss']
})

export class AddReceivingComponent implements OnInit, OnDestroy {
  readonly ICON = ICON;
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onRestart = new EventEmitter<void>();
  @ViewChild('contextMenu', { static: false }) contextMenu!: ElementRef;
  readonly lotCategories = this.appService.masterData.lotCategory;
  lotCategorySelected: LotCategory | undefined;
  
  readonly deviceTypes: DeviceType[] = [];
  deviceTypeSelected: DeviceType | undefined;
  readonly lotIdentifiers = [
    { name: 'Test', id: 'Test' },
    { name: 'Test&Rel', id: 'Test&Rel' },
    { name: 'Rel', id: 'Rel' },
    { name: 'Customer Lot', id: 'Customer Lot' },
    { name: 'TBD', id: 'TBD' },
  ]
  lotIdentifierSelected: { name: string; id: string } | undefined;
  
  isHoldCheckboxEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == 'HoldCheckbox')?.active ?? true;
  isHoldCommentEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == "HoldComments")?.active ?? true;

  isDisabled: any = {
    clearReceipt: false,
    addReceipt: false,
    addDevice: false,
    addHardware: false,
    addMisc: false,
    cancelBtn: false,
    addInterim:false
  }
  readonly subscription = new Subscription()
  readonly filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  
  isPMRole:boolean = false;
  isReceiverOrMail:boolean = false;

  mailroomNumber:string = ''
  stagingLocation:string = ''
  readonly countries = this.appService.masterData.country;
  public gridDataDevice: DeviceItem[] = [];
  currentBehalfID: any;
  isVisibleHoldComments = true;
  isDisableHoldComments = false;
  isDisableReceipt = false;
  behalfOfCusotmerSelected:any;
  isViewMode: boolean = false;
  isEditMode: boolean = false;
  
  readonly employees: Employee[] = this.appService.masterData.entityMap.Employee
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
    { text: 'Receive', svgIcon: ICON.cartIcon },
    { text: 'Undo Receive', svgIcon: ICON.cartIcon, disabled: true },
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    { text: 'Remove', svgIcon: ICON.trashIcon },
  ];
  private readonly RowActionMenuDevice: MenuItem[] = [
    { text: 'Receive', svgIcon: ICON.cartIcon },
    { text: 'Undo Receive', svgIcon: ICON.cartIcon, disabled: true },
    { text: 'Print', svgIcon: ICON.printIcon },
    { text:  'Hold', icon:'hold', svgIcon: ICON.pauseIcon}   
  ]
  private readonly RowActionMenuDeviceAdd: MenuItem[] = [
    { text: 'Remove', svgIcon: ICON.trashIcon }
  ]
  recevingFormDetails: any;

  constructor(public appService: AppService, private apiService: ApiService, private router: Router) { 
    
  }

  ngOnInit(): void {
    this.init();
    this.subscription.add(this.appService.sharedData.receiving.eventEmitter.subscribe((v) => {
      switch (v) {
        case 'canCloseDialog?':
          let closeDialog = false;
          closeDialog = this.areThereAnyChanges();
          if (closeDialog) {
            closeDialog = confirm('Do you want to Discard changes?')
          } else {
            closeDialog = true
          }
          if (closeDialog) {
            this.appService.sharedData.receiving.eventEmitter.emit('closeDialog');
          }
          break;
        default:
          break;
      }
    }))
  }
  ngAfterViewInit() {
   if (this.contextMenu) {
       this.contextMenu.nativeElement.addEventListener('wheel', this.preventScroll, { passive: false });
     }
   }
 
  ngOnDestroy(): void {
    this.appService.sharedData.receivingForm.isEditMode = false
    this.appService.sharedData.receivingForm.isViewMode = false;
    this.subscription.unsubscribe();
    if (this.contextMenu) {
       this.contextMenu.nativeElement.removeEventListener('wheel', this.preventScroll);
     }
  }

  private preventScroll(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
    init() {
      if(this.appService.sharedData.receivingForm.isEditMode || this.appService.sharedData.receivingForm.isViewMode){
        this.getRecevingFormDetails(this.appService.sharedData.receivingForm.dataItem.receiptId);
        this.isViewMode = this.appService.sharedData.receivingForm.isViewMode;
        this.isEditMode = this.appService.sharedData.receivingForm.isEditMode;
      }
    }
    getRecevingFormDetails(receiptId:number)  {
      this.apiService.getRecevingFormDetails(receiptId).subscribe({
        next : (data:any) => {
          this.recevingFormDetails = data;
          this.bindData();
        },
        error: (err) => {
  
        }
      })
    }
    bindData() {
      if (this.recevingFormDetails) {
        this.mailroomNumber = this.recevingFormDetails.mailRoomNo || '';
        this.stagingLocation = this.recevingFormDetails.stagingLocation || '';
        this.gridDataDevice = this.recevingFormDetails.devices || [];
        this.gridDataDevice.forEach((d, index) => {
          d.countrySelected = this.countries.find(c => c.countryName == d.coo);
          d.deviceTypeSelected = this.deviceTypes.find(dt => dt.deviceTypeID == d.deviceTypeID);
          if (d.lotIdentifier) {
            d.lotIdentifierSelected = this.lotIdentifiers.find(l => l.id == d.lotIdentifier);
          }
          d.isEditable = !!(d.isReceived && d.canEdit);
          d.rowActionMenu = this.RowActionMenuDevice.map(o => ({ ...o }));
        })
      }
    }    

  private fetchDevicesByCustomer() {
    
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.behalfID) {
      return;
    }
    if (this.currentBehalfID == dataItem.behalfID) {
      return;
    }
    this.currentBehalfID = dataItem.behalfID;
    this.apiService.getDevicesByCustomer(dataItem.behalfID).subscribe({
      next: (v: any) => {
        
        this.deviceTypes.length = 0;
        this.deviceTypes.push(...v);
        this.gridDataDevice.forEach((d) => {
          d.deviceTypeSelected = this.deviceTypes.find(dt => dt.deviceTypeID == d.deviceTypeID)
        });
      },
      error: (e: any) => { }
    })
  }
  onSearch() {
    const mailroom = this.mailroomNumber?.trim() || null;
    const staging = this.stagingLocation?.trim() || null;
  
    if (mailroom || staging) {
      this.apiService.getDeviceData(mailroom,staging).subscribe({
        next: (v: any) => {
          this.gridDataDevice = v;
          this.gridDataDevice.forEach((d, index) => {
            d.countrySelected = this.countries.find(c => c.countryName == d.coo)
            d.deviceTypeSelected = this.deviceTypes.find(dt => dt.deviceTypeID == d.deviceTypeID)
            if (d.lotIdentifier) {
              d.lotIdentifierSelected = this.lotIdentifiers.find(l => l.id == d.lotIdentifier);
            }
            d.isEditable = !!(d.isReceived && d.canEdit);
            d.rowActionMenu = this.RowActionMenuDevice.map(o => ({ ...o }));
          })
        }
      });
    }
  }  

  onEdit(dataItem: DeviceItem) {
    if (dataItem.deviceID > 0) {
      dataItem.recordStatus = 'U';
    }
  }  
  
  saveReceiving() {
    if (!this.gridDataDevice || !this.gridDataDevice.length) {
      this.appService.infoMessage(MESSAGES.NoChanges)
    }
    const updatedRows = this.gridDataDevice.filter(d => d.recordStatus === 'U');
    if (updatedRows.length === 0) {
      this.appService.infoMessage(MESSAGES.NoChanges)
      return;
    }
    const missingDevice = updatedRows.filter(d => !d.deviceID);
    const missingReceipt = updatedRows.filter(d => !d.receiptID);
    const missingDateCode = updatedRows.filter(d => !d.dateCode?.toString().trim());
    const missingLabelCount = updatedRows.filter(
      d => (d.labelCount === null || d.labelCount === undefined || d.labelCount <= 0) && !d.wasUndoReceive
    );
    const missingCOO = updatedRows.filter(d => !d.countrySelected);
    const missingLotId = updatedRows.filter(d => !d.lotId);

if (missingDevice.length > 0) {
  this.appService.errorMessage('Device is required for all edited rows.');
  return;
}
if (missingReceipt.length > 0) {
  this.appService.errorMessage('Receipt ID is required for all edited rows.');
  return;
}
if (missingDateCode.length > 0) {
  this.appService.errorMessage('Date Code is required for all edited rows.');
  return;
}
if (missingLabelCount.length > 0) {
  this.appService.errorMessage('Label Count is required for all edited rows.');
  return;
}
if (missingCOO.length > 0) {
  this.appService.errorMessage('COO is required for all edited rows.');
  return;
}
if (missingLotId.length > 0) {
  this.appService.errorMessage('Lot ID is required for all edited rows.');
  return;
}

const receivingDetails = updatedRows.map(d => ({
  DeviceId: d.deviceID,
  LabelCount: d.labelCount,
  LotId: d.lotId,
  DateCode: d.dateCode,
  COO: d.countrySelected?.countryID, 
  IsReceived: d.isReceived ? 1 : 0,
}));
const payload = {
  ReceivedDetails: receivingDetails 
};

        const receivingJson = JSON.stringify(payload);
        const receiptId = updatedRows[0]?.receiptID;
        const loginId = this.appService.loginId;
        this.apiService.processReceivingData(receivingJson, receiptId, loginId).subscribe({
          next: (v: any) => {
            this.appService.successMessage(MESSAGES.DataSaved);
            this.onClose.emit();
          },
          error: (err) => {
            this.appService.errorMessage(MESSAGES.DataSaveError);
            console.log(err);
          }
        });
  }
  
  onSelectRowActionMenu(e: ContextMenuSelectEvent, dataItem: any, rowIndex: number) {
    switch (e.item.text) {
     
      case 'Receive':
        this.receiveRow(dataItem);
        break;
      case 'Undo Receive':
        this.canUndoReceive(dataItem);
        break;
    
      case 'Print':
        this.doPrint(dataItem)
        break;
      case 'Hold':
        this.goToHold(dataItem);
        break;
      default:
        break;
    }
  }
  onOpenRowActionMenu(dataItem: any) {
    
    const a = this.rowActionMenu.find(a => a.text == ActionType.Remove);
    if (a) a.disabled = false;

    this.enableDisableRowMenuItems(dataItem);
  }

  enableDisableRowMenuItems(dataItem:any){
    
    const receiveMenuItem = dataItem.rowActionMenu.find((a: any) => a.text == ActionType.Receive);
    const undoRreceiveMenuItem = dataItem.rowActionMenu.find((a: any) => a.text == ActionType.UndoReceive);
    const printMenuItem = dataItem.rowActionMenu.find((a: any) => a.text == ActionType.Print);
    const holdMenuItem = dataItem.rowActionMenu.find((a: any) => a.text == ActionType.Hold);
    if (dataItem.isReceived) {
      if (dataItem.canEdit) {
        if (undoRreceiveMenuItem) 
          undoRreceiveMenuItem.disabled = false;
        if (printMenuItem) 
          printMenuItem.disabled = false;
        if (receiveMenuItem) 
          receiveMenuItem.disabled = true;
        if (holdMenuItem) 
          holdMenuItem.disabled = false;
      } else {
        if (undoRreceiveMenuItem) 
          undoRreceiveMenuItem.disabled = true;
        if (printMenuItem) 
          printMenuItem.disabled = false;
        if (receiveMenuItem) 
          receiveMenuItem.disabled = true;
        if (holdMenuItem) 
         holdMenuItem.disabled = false;
      }
    }
    else{
      if(undoRreceiveMenuItem)
         undoRreceiveMenuItem.disabled = true
      if (printMenuItem)
         printMenuItem.disabled = false;
      if (receiveMenuItem)
         receiveMenuItem.disabled = false;
      if (holdMenuItem)
        holdMenuItem.disabled = false;
    }    
  }

  doEditRow(dataItem:any) {
   dataItem.recordStatus = 'U'
   dataItem.dateCode = parseInt(dataItem.dateCode);
  }
  private doRemoveRow(rowIndex: number) {
   this.gridDataDevice.splice(rowIndex, 1);
  }
  private doPrint(r: any) {
    const filteredData = this.getFilteredPrintData(r);
    const formattedHTML = this.generatePrintHTML(filteredData);
    this.printPreview(formattedHTML);
  }

  private generatePrintHTML(data: any): string {  
    return `
      <html>
        <head>
           <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 600px; margin: auto; padding: 20px; }
          h2, h3 {
            text-align: center;
            margin-bottom: 10px;
          }
          .header {
            text-align: right;
            margin-left: 20px;
          }
          .label {
            font-weight: bold;
            display: inline-block;
            width: 40%;
            text-align: left;
          }
          .value {
            display: inline-block;
            width: 55%;
            text-align: left;
          }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            font-size: 18px;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            font-size: 14px;
          }
        </style>
        </head>
        <body>
          <div class="container">
            <div class="row"><img src="assets/lotcard.PNG"></div>
            <div class="row"><span class="label">ISE Lot#:</span> ${data.ISE_Lot}</div>
            <div class="row"><span class="label">Customer Lot#:</span> ${data.Cust_Lot}</div>
            <div class="row"><span class="label">Customer Count:</span> ${data.Cust_Cnt}</div>
            <div class="row"><span class="label">Expedite:</span> ${data.Expedite}</div>
            <div class="row"><span class="label">IQA Optional:</span> ${data.IQA_Optional}</div>
            <div class="row"><span class="label">Device Type Name:</span> ${data.Device_Type_Name}</div>
            <div class="row"><span class="label">Lot Owner:</span> ${data.Lot_Owner}</div>
            <div class="row"><span class="label">Lot Identifier:</span> ${data.Lot_Identifier}</div>
            <div class="row"><span class="label">Label Count:</span> ${data.Label_Count}</div>
            <div class="row"><span class="label">Date Code:</span> ${data.Date_Code}</div>
            <div class="row"><span class="label">COO:</span> ${data.COO}</div>
          </div>
        </body>
      </html>
    `;
  }  
  
  private getFilteredPrintData(dataItem: any) {
    return {
      ISE_Lot: dataItem.iseLotNumber,  
      Cust_Lot: dataItem.customerLotNumber,  
      Cust_Cnt: dataItem.customerCount,  
      Expedite: dataItem.expedite,  
      IQA_Optional: dataItem.iqa,
      Device_Type_Name : dataItem.deviceType,
      Lot_Owner: dataItem.lotOwner,  
      Lot_Identifier: dataItem.lotIdentifier,  
      Label_Count: dataItem.labelCount,  
      Date_Code: dataItem.dateCode,  
      COO: dataItem.coo
    };
  }
  
  private printPreview(textToPrint: string) {
    // Hide background elements (popup or overlay)
    const popupElement = document.querySelector('.popup-container') as HTMLElement | null;
    if (popupElement) {
      popupElement.style.display = 'none';
    }
  
    // Open print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups and try again.");
      return;
    }
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Preview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .container { max-width: 600px; margin: auto; padding: 20px; }
            h2, h3 { text-align: center; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; }
            .label { font-weight: bold; width: 40%; text-align: left; }
            .value { width: 55%; text-align: left; }
            .footer { text-align: center; margin-top: 50px; font-size: 14px; }
            @media print {
              body { visibility: visible !important; }
              .container { visibility: visible !important; }
            }
          </style>
        </head>
        <body>
          ${textToPrint}
        </body>
      </html>
    `);
    printWindow.document.close();
  
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
  
      // Restore background elements after printing
      if (popupElement) {
        popupElement.style.display = 'block';
      }
    }, 500);
  }  
  
  private doVoidData(r: any, rowIndex: number) {
    this.setLineItemToVoid(this.gridDataDevice,rowIndex);
    this.saveReceiving();
  }

  setLineItemToVoid(grid:any, rowIndex:number){
    grid[rowIndex].active = false;
    grid[rowIndex].recordStatus = "U";
  }

  private updateKeysToTitleCase(jsonObj: any) {
    const updatedObj: any = {};

    for (const key in jsonObj) {
      const updatedKey = key.charAt(0).toUpperCase() + key.slice(1);
      updatedObj[updatedKey] = jsonObj[key];
    }

    return updatedObj;
  }
  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }
  disabledAllBtns() {
    Object.keys(this.isDisabled).forEach((k: any) => {
      this.isDisabled[k] = true;
    });
  }
  
  private areThereAnyChanges(): boolean {
    if (this.appService.sharedData.receivingForm.isViewMode || this.appService.sharedData.receivingForm.isEditMode) {
      return false
    }
    else{
      const valuesToCheck = [
        this.mailroomNumber,
        this.stagingLocation,
        ...(this.gridDataDevice || []) 
      ];
    
      const hasTruthyValue = valuesToCheck.some(v => {
        if (Array.isArray(v)) {
          return v.length > 0;
        }
        return !!v;
      });
    
      return hasTruthyValue;
    }
    
  }
  
  // print
  @ViewChild('pdfExport', { static: true }) pdfExportComponent!: PDFExportComponent;
  printSection() {
    this.pdfExportComponent.paperSize = 'A4'
    this.pdfExportComponent.landscape = true;
    this.pdfExportComponent.scale = 0.6;
    this.pdfExportComponent.margin = '0.9cm';
    this.pdfExportComponent.fileName = 'Receipt ' + new Date().toLocaleString();
    this.pdfExportComponent.saveAs();
  }
  onChangeLotIdentifier(dataItem: DeviceItem) {
    dataItem.lotIdentifier = dataItem.lotIdentifierSelected?.id;
    if (dataItem.recordStatus != 'I') {
      dataItem.recordStatus = "U";
    }
  }
  // For hold dailog box
  public holdData: any = {};
  onHoldChange(dataItem: any): void {
    if (dataItem.isHold) {
      this.holdData = { ...dataItem };
      this.openDialog();
    }
  }

 
  onLotValueChange(selectLot: any, dataItem:any, indx :any): void {
    
    this.apiService.getDeviceDetailsById(selectLot.inventoryID).subscribe({
      next: (devDetails:any) =>{
    
        if(devDetails.length > 0){
          const devicDetail = devDetails[0];
          dataItem.deviceType = devicDetail.deviceType;
          dataItem.customerCount = devicDetail.customerCount;
          dataItem.labelCount = devicDetail.labelCount;
        }
      }
    })
  }
  private receiveRow(dataItem:any) {
    
    dataItem.isEditable = true;
    dataItem.isReceived = true;
    if (dataItem.rowActionMenu) {
      dataItem.rowActionMenu[0].disabled = true;
      dataItem.rowActionMenu[1].disabled = false;
    }
  }
  private canUndoReceive(dataItem:any) {
    
    dataItem.isReceived = false;
    dataItem.wasUndoReceive = true;
    if (dataItem.rowActionMenu) {
      dataItem.rowActionMenu[0].disabled = false;
      dataItem.rowActionMenu[1].disabled = true;
    }
    dataItem.labelCount = 0;
    dataItem.isEditable = false;
    dataItem.recordStatus = 'U';
  }
  goToHold(dataItem: any): void {
  this.router.navigate(['/inventory-hold'], {
     state: { data: dataItem }
  });
}

  receiveLineItem(dataItem:any){
    if (dataItem.recordStatus != 'I') {
      dataItem.recordStatus = 'U';
    }
    dataItem.isReceived = true;
    if (dataItem.rowActionMenu) {
      dataItem.rowActionMenu[0].disabled = true;
      dataItem.rowActionMenu[1].disabled = false;
    }
  }

  doHoldUnHold(dataItem:any) {
   dataItem.isHold = !dataItem.isHold
  }

  disableReceipt() {
    const deviceItemReceived: boolean  = this.gridDataDevice.find(o => o.isReceived == true) == undefined ? false : true
    
    if(deviceItemReceived == true) {
      this.isDisableHoldComments = true;
    }
    else {
      this.isDisableHoldComments = false;
    }
  }
}
