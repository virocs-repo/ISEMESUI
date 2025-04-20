import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ActiveColorClickEvent } from '@progress/kendo-angular-inputs';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
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

  //@ViewChild('noOfCartons', { static: false, }) noOfCartons: ElementRef | undefined;

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
    // { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    // { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
    // { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
    { text: 'Remove', svgIcon: ICON.trashIcon },
  ];
  private readonly RowActionMenuDevice: MenuItem[] = [
    { text: 'Receive', svgIcon: ICON.cartIcon },
    { text: 'Undo Receive', svgIcon: ICON.cartIcon, disabled: true },
    { text: 'Print', svgIcon: ICON.printIcon },
    { text: 'Hold', svgIcon: ICON.kpiStatusHoldIcon },
    { text: 'Edit Data', svgIcon: ICON.pencilIcon },
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon }
  ]
  private readonly RowActionMenuDeviceAdd: MenuItem[] = [
    { text: 'Remove', svgIcon: ICON.trashIcon }
  ]

  constructor(public appService: AppService, private apiService: ApiService) { 
    
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
    this.initRoleBasedUI()
  }
  ngOnDestroy(): void {
    this.appService.sharedData.receiving.isEditMode = false
    this.appService.sharedData.receiving.isViewMode = false;
    this.subscription.unsubscribe();
  }

  private initRoleBasedUI() {
    const appMenu = this.appService.userPreferences?.roles.appMenus.find(am => am.menuTitle == "Receiving Menu");
    if (!appMenu) {
      console.error('No appMenus found');
      return;
    }
    if (this.appService.sharedData.receiving.isEditMode) {
      // edit mode
      const appFeatureFields = appMenu.appFeatures?.find(af => af.featureName == "Receiving Edit")?.appFeatureFields
      if (appFeatureFields) {
        this.initInputFields(appFeatureFields);
      }
    } else if (this.appService.sharedData.receiving.isViewMode) {
      // view mode
      // in view mode all the field are disabled
    } else {
      // add mode
      const appFeatureFields = appMenu.appFeatures?.find(af => af.featureName == "Receiving Add")?.appFeatureFields
      if (appFeatureFields) {
        this.initInputFields(appFeatureFields);
      }
    }
  }
  private initInputFields(appFeatureFields: AppFeatureField[]) {
    appFeatureFields.forEach(aff => {
      switch (aff.featureFieldName) {
        case "ReceiptHold":
          debugger;
          this.isDisableHoldComments = !aff.isWriteOnly
          break;
        default:
          break;
      }
    });
  }

  private init() {
    
    this.fetchDataDevice();

    // if (this.appService.sharedData.receiving.isViewMode || this.appService.sharedData.receiving.isEditMode) {
    //   const dataItem = this.appService.sharedData.receiving.dataItem;
    //   debugger;
    //   if(this.appService.userName == 'PM') {
    //     this.isPMRole = true;
    //   }
    //   else if(this.appService.userName == 'Receiving' || this.appService.userName == 'Male') {
    //     this.isReceiverOrMail = true;      
    //   }
    //   else {
    //     this.isPMRole = this.isReceiverOrMail = true;
    //   }

    // } else {
    //   this.appService.sharedData.receiving.isEditMode = false
    //   this.appService.sharedData.receiving.isViewMode = false
    //   this.appService.sharedData.receiving.dataItem = {}

    // }
    // if (this.appService.sharedData.receiving.isViewMode) {
    //   this.disabledAllBtns()
    // }
  }

  onChangeBehalfOfCusotmer() {
    if (this.appService.sharedData.receiving.dataItem) {
      this.appService.sharedData.receiving.dataItem.behalfID = this.behalfOfCusotmerSelected?.CustomerID;
      this.fetchDevicesByCustomer();
    }
  }

  private fetchDevicesByCustomer() {
    
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.behalfID) {
      // this is for new form
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

  private fetchDataDevice() {
    
    // if(this.mailroomNumber !== '' || this.stagingLocation !== '') {
    //   return;
    // }

    this.apiService.getDeviceData('1').subscribe({
      next: (v: any) => {
        this.gridDataDevice = v;
        // this.goodsTypeSelected = this.goodsType.find(v => v.goodsTypeName == 'Device')
        this.gridDataDevice.forEach((d, index) => {
          d.employeeSelected = this.employees.find(e => e.EmployeeID == d.lotOwnerID);
          d.countrySelected = this.countries.find(c => c.countryName == d.coo)
          d.deviceTypeSelected = this.deviceTypes.find(dt => dt.deviceTypeID == d.deviceTypeID)
          if (index == 0) {
            this.lotCategorySelected = this.lotCategories.find(c => c.lotCategoryID == d.lotCategoryID)
          }
          if (d.lotIdentifier) {
            d.lotIdentifierSelected = this.lotIdentifiers.find(l => l.id == d.lotIdentifier);
          }
          d.rowActionMenu = this.RowActionMenuDevice.map(o => ({ ...o }));
        })
        
        if(this.gridDataDevice.length > 0)
          this.disableReceipt();
      }
    });
  }
  // addDevice
  
  saveReceiving() {
    if (!this.lotCategorySelected?.lotCategoryID) {
      this.appService.errorMessage("Please select Lot Category!")
      return;
    }
    const lotCategoryIDSelected = this.lotCategorySelected.lotCategoryID;
    this.gridDataDevice.forEach(d => {
      if (d.lotCategoryID != 0 && d.lotCategoryID != lotCategoryIDSelected) {
        d.lotCategoryID = lotCategoryIDSelected;
        d.recordStatus = "U";
      }
    })

    if (!this.gridDataDevice || !this.gridDataDevice.length) {
      this.appService.infoMessage(MESSAGES.NoChanges)
    }
    const filteredRecords = this.gridDataDevice.filter(d => d.recordStatus == "I" || d.recordStatus == "U")
    if (!filteredRecords || filteredRecords.length < 1) {
      this.appService.infoMessage(MESSAGES.NoChanges);
      return;
    }
    const DeviceDetails: PostDevice[] = []
    for (let index = 0; index < filteredRecords.length; index++) {
      const r = filteredRecords[index];
      const mandatoryFields = [
        r.dateCode, r.countrySelected, r.deviceTypeSelected?.deviceTypeID
      ]
      const isValid = !mandatoryFields.some(v => !v);
      if (!r.customerLotNumber) {
        r.error = true;
        this.appService.errorMessage("Customer Lot# is required!");
        return;
      }
      if (!r.customerCount || r.customerCount < 1) {
        r.error = true;
        this.appService.errorMessage("Customer Count should be greater than zero!");
        return;
      }
      if (!r.deviceTypeSelected) {
        r.error = true;
        this.appService.errorMessage("Please select Device Type!");
        return;
      }
      if (r.isReceived) {
        if (!r.labelCount || r.labelCount < 1) {
          r.error = true;
          this.appService.errorMessage("Label count should be greater than zero!")
          return;
        }
        if (!r.dateCode) {
          r.error = true;
          this.appService.errorMessage("Date Code is required!")
          return;
        }
        if (!r.countrySelected) {
          r.error = true;
          this.appService.errorMessage("Please select COO!")
          return;
        }
      }
      const clnStr = r.customerCount.toString() || ''
      const cln = parseInt(clnStr);
      const lcStr = r.labelCount?.toString() || '';
      const lc = parseInt(lcStr);

      if (r.isReceived) {
        if (cln != lc) {
          r.isHold = true;
        } else {
          r.isHold = false
        }
      }
      const postDevice: PostDevice = {
        // @ts-ignore
        IseLotNumber: r.iseLotNumber,
        DeviceID: r.deviceID,
        ReceiptID: r.receiptID,
        CustomerLotNumber: r.customerLotNumber,
        CustomerCount: r.customerCount,
        Expedite: r.expedite,
        IQA: r.iqa,
        LotIdentifier: r.lotIdentifier,
        LotOwnerID: r.employeeSelected?.EmployeeID || this.appService.loginId,
        LabelCount: r.labelCount,
        DateCode: r.dateCode?.toString() || '',
        COO: r.countrySelected?.countryID || null,
        IsHold: r.isHold,
        HoldComments: r.holdComments,
        RecordStatus: r.recordStatus || 'I',
        Active: r.active,
        LoginId: this.appService.loginId,
        LotCategoryID: this.lotCategorySelected?.lotCategoryID || 1,
        DeviceTypeID: r.deviceTypeSelected?.deviceTypeID || 1,
        IsReceived: r.isReceived == undefined ? false : r.isReceived
      }

      if (postDevice.RecordStatus == "I") {
        postDevice.DeviceID = null;
      }

      DeviceDetails.push(postDevice)
    }
    
    this.apiService.postProcessDevice({ DeviceDetails }).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.fetchDataDevice();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
    });
  }
  // addRowDevice() {
  //   const dataItem = this.appService.sharedData.receiving.dataItem;
  //   this.appService.isLoading = true;
  //   this.apiService.generateLineItem().subscribe({
  //     next: (v: any) => {
  //       this.appService.isLoading = false;
  //       this.gridDataDevice.splice(0, 0, {
  //         ...INIT_DEVICE_ITEM, receiptID: dataItem.receiptID, recordStatus: "I",
  //         lotIdentifierSelected: this.lotIdentifiers[0],
  //         lotIdentifier: this.lotIdentifiers[0].id,
  //         iseLotNumber: v.data + '',
  //         rowActionMenu: this.RowActionMenuDeviceAdd.map(o => ({ ...o }))
  //       });
  //     },
  //     error: (e: any) => {
  //       this.appService.isLoading = false;
  //       this.appService.errorMessage('Unable to add new device row');
  //     }
  //   })
  // }
  
  onSelectRowActionMenu(e: ContextMenuSelectEvent, dataItem: any, rowIndex: number) {
    switch (e.item.text) {
      case 'Edit Data': 
      this.doEditRow(dataItem);
        break;
      case 'Receive':
        this.receiveRow(dataItem);
        break;
      case 'Undo Receive':
        this.canUndoReceive(dataItem);
        break;
      case 'Hold':
        this.doHoldUnHold(dataItem);
        break;
      case 'Print':
        this.doPrint(dataItem)
        break;
      case 'Void Data':
        this.doVoidData(dataItem, rowIndex)
        break;
      case 'Remove':
        this.doRemoveRow(rowIndex);
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
    const voidMenuItem = dataItem.rowActionMenu.find((a: any) => a.text == ActionType.VoidData);
    const editMenuItem = dataItem.rowActionMenu.find((a: any) => a.text == ActionType.EditData);
    const removeMenuItem = dataItem.rowActionMenu.find((a: any) => a.text == ActionType.Remove);
    const holdMenuItem = dataItem.rowActionMenu.find((a: any) => a.text == ActionType.Hold);

    if (dataItem.recordStatus != 'I') {
      if (removeMenuItem)
        removeMenuItem.disabled = true;
      if (printMenuItem)
        printMenuItem.disabled = false;

      if(dataItem.isReceived == true) {
        if(undoRreceiveMenuItem)
          undoRreceiveMenuItem.disabled = false
        if(receiveMenuItem)
          receiveMenuItem.disabled = true
        if(editMenuItem)
          editMenuItem.disabled = true
        if(voidMenuItem)
          voidMenuItem.disabled = true
        if(holdMenuItem)
          holdMenuItem.disabled = true;
      }
      else {
        if(undoRreceiveMenuItem)
          undoRreceiveMenuItem.disabled = true
        if(receiveMenuItem)
          receiveMenuItem.disabled = false
        if(editMenuItem)
          editMenuItem.disabled = false
        if(voidMenuItem)
          voidMenuItem.disabled = false
        if(holdMenuItem)
          holdMenuItem.disabled = false;
      }
    }
    else {
      if (removeMenuItem)
        removeMenuItem.disabled = false;
      if(printMenuItem)
        printMenuItem.disabled = true;
      if(undoRreceiveMenuItem)
        undoRreceiveMenuItem.disabled = true
      if(receiveMenuItem)
        receiveMenuItem.disabled = true
      if(editMenuItem)
        editMenuItem.disabled = true
      if(voidMenuItem)
        voidMenuItem.disabled = true
      if(holdMenuItem)
        holdMenuItem.disabled = true;
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
            <div class="row"><span class="label">Device Type Name:</span> ${data.deviceTypes}</div>
            <div class="row"><span class="label">Device:</span> ${data.device}</div>
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
      Device_Type_Name : dataItem.deviceType,
      Device: dataItem.devi,  
      Lot_Owner: dataItem.lot,  
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
  
  valueNormalizerCustomer = (text: Observable<string>) => text.pipe(map((content: string) => {
    const customer: Customer = { CustomerID: 9999, CustomerName: content };
    return customer;
  }));
  valueNormalizerVendor = (text: Observable<string>) => text.pipe(map((content: string) => {
    const vendor: Vendor = { VendorID: 9999, VendorName: content };
    return vendor
  }));
  
  
  private areThereAnyChanges() {
    // new form
    const valuesToCheck = [
      this.stagingLocation,
      
    ]
    const hasTruthyValue = valuesToCheck.some(v => v);
    return hasTruthyValue
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

  onCountUIChange(value: any): string {

    // Return the UI value without leading zeros
    return value.replace(/^0+/, '');
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

  canUndoReceive(dataItem:any) {
    
    if(!dataItem.inventoryID || dataItem.inventoryID < 1) {
      return;
    }

    this.apiService.canUndoReceive(dataItem.inventoryID).subscribe({
      next: (v:any) => {
        
        if(v == true)
        {
          dataItem.recordStatus = 'U';
          dataItem.isReceived = false;
          if (dataItem.rowActionMenu) {
            dataItem.rowActionMenu[0].disabled = false;
            dataItem.rowActionMenu[1].disabled = true;
          }
        }
        else
        {
          alert("You are not allowed to undo recieve this line item now.");
        }
      }})
  }

  private receiveRow(dataItem:any) {
    if (dataItem.recordStatus != 'I') {
      dataItem.recordStatus = 'U';
    }
    dataItem.isReceived = true;
    dataItem.dateCode = parseInt(dataItem.dateCode) || '';
    if (dataItem.rowActionMenu) {
      dataItem.rowActionMenu[0].disabled = true;
      dataItem.rowActionMenu[1].disabled = false;
    }
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
