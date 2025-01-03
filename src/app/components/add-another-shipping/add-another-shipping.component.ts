import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { PDFExportComponent } from '@progress/kendo-angular-pdf-export';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { map, Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { INIT_ANOTHERSHIPDETAILS, AnotherShipDetails, INIT_OTHERSHIPPING_ITEM, AnotherShippingLineitem, KeyValueData, Address, Country, CourierDetails, Customer, CustomerType, DeliveryMode, DeviceItem, DeviceType, Employee, EntityType, GoodsType, HardwareItem, ICON, INIT_DEVICE_ITEM, INIT_HARDWARE_ITEM, INIT_MISCELLANEOUS_GOODS, INIT_POST_DEVICE, INIT_POST_RECEIPT, JSON_Object, LotCategory, MESSAGES, MiscellaneousGoods, PostDevice, PostHardware, PostMiscGoods, PostReceipt, ReceiptLocation, SignatureTypes, Vendor } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

// enum TableType {
//   Device = 'Device',
//   Hardware = 'Hardware',
//   Misc = 'Misc'
// }
enum ActionType {
  Remove = 'Remove',
  Edit = 'Edit Data',
  Void = 'Void Data'
}

@Component({
  selector: 'app-add-another-shipping',
  templateUrl: './add-another-shipping.component.html',
  styleUrls: ['./add-another-shipping.component.scss']
})
export class AddAnotherShippingComponent implements OnInit, OnDestroy {
  readonly ICON = ICON;
  //readonly TableType = TableType;
  @Output() onClose = new EventEmitter<void>();

  readonly customerTypes: CustomerType[] = this.appService.masterData.customerType;
  customerTypeSelected: CustomerType | undefined;
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  readonly goodsType: GoodsType[] = this.appService.masterData.goodsType;
  goodsTypeSelected: GoodsType | undefined;
  isDisabledGoodsType = false;
  readonly deliveryMode: DeliveryMode[] = this.appService.masterData.deliveryMode;
  deliveryModeSelected: DeliveryMode | undefined;

  behalfOfCusotmerSelected: Customer | undefined;
  behalfOfVendorSelected: Vendor | undefined;
  contactPhone = '';
  contactPerson = ''

  name: string = '';
  //email: string = '';
  comments: string = '';
  deliveryComments: string = '';
  address: any;
  readonly addresses: Address[] = this.appService.masterData.addresses;
  addressSelected: Address | undefined;
  
  
  readonly couriers = this.appService.masterData.courierDetails
  courierSelected: CourierDetails | undefined
  readonly lotCategories = this.appService.masterData.lotCategory;
  lotCategorySelected: LotCategory | undefined;
  readonly deviceTypes = this.appService.masterData.deviceType;
  deviceTypeSelected: DeviceType | undefined;
  readonly lotIdentifiers = [
    { name: 'Test', id: 'Test' },
    { name: 'Test&Rel', id: 'Test&Rel' },
    { name: 'Rel', id: 'Rel' },
    { name: 'Customer Lot', id: 'Customer Lot' },
    { name: 'TBD', id: 'TBD' },
  ]
  lotIdentifierSelected: { name: string; id: string } | undefined;

  description: string = '';

  isHoldCheckboxEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == 'HoldCheckbox')?.active ?? true;
  isHoldCommentEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == "HoldComments")?.active ?? true;

  expectedOrNot: 'Expected' | 'Unexpected' = 'Expected'
  isFTZ: boolean = false;
  isInterim: boolean = false;
  isDisabled: any = {
    clearAnotherShipping: false,
    addAnotherShipping: false,
    addLineIem: false,
  }
  
  tracking = ''
  
  readonly subscription = new Subscription()
  readonly filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  recipientName: string = "";
  phoneNumber: string = "";
  requestorEmail:string = "";
  accountNumber:number = 0;
  requestorSelected: Employee | undefined;
  serviceTypes: KeyValueData[] = [];
  serviceTypeSelected: any | undefined;
  requestorAddress:string = "RequestorAddress";
  customerOrVendor: 'Customer' | 'Vendor' = 'Customer';
  customerTypeID: number = 1; //by default customer
  shipToAddress1:string = "";
  shipToAddress2:string = "";
  shipToCity:string = "";
  shipToState:string = "";
  shipToZip:string = "";
  readonly countries: Country[] = this.appService.masterData.country
  countrySelected: Country | undefined;
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
  readonly vendors: Vendor[] = this.appService.masterData.entityMap.Vendor;
  vendorSelected: Vendor | undefined;
  shipToInstructions:string = "";
  lotNumbers: any[] = [];
  allLotNumbers: any[] = []; // F
  anotherShipDetails: AnotherShipDetails = {
    ...INIT_ANOTHERSHIPDETAILS
  };
  signatureName = ''
  
  readonly employees: Employee[] = this.appService.masterData.entityMap.Employee
  signatureEmployeeSelected: Employee | undefined;
  
  expectedDateTime: Date = new Date();
  format = "MM/dd/yyyy HH:mm";
  public lineItemsGrid: AnotherShippingLineitem[] = [];
  isViewOrEdit:boolean = false;
  approverId:number=0;
  approvedById:number=0;

  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.init();
    this.subscription.add(this.appService.sharedData.anotherShipping.eventEmitter.subscribe((v) => {
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
            this.appService.sharedData.anotherShipping.eventEmitter.emit('closeDialog');
          }
          break;
        default:
          break;
      }
    }))
  }
  ngOnDestroy(): void {
    this.appService.sharedData.anotherShipping.isEditMode = false
    this.appService.sharedData.anotherShipping.isViewMode = false;
    this.subscription.unsubscribe();
  }

  private init() {
     
    this.getServiceTypes();

    if (this.appService.sharedData.anotherShipping.isViewMode || this.appService.sharedData.anotherShipping.isEditMode) {
      //this.appService.sharedData.anotherShipping.dataItem.anotherShipmentID = 1;
      this.isViewOrEdit = true;
      this.getOtherInventoryShipment(this.appService.sharedData.anotherShipping.dataItem.anotherShipmentID);
    if (this.appService.sharedData.anotherShipping.isViewMode) {
      this.disabledAllBtns()
    }
  }
  else {
    this.isViewOrEdit = false;
  }
}
private bindData(){

  var customerVendorId:number;
  if(this.anotherShipDetails.anotherShipmentID > 0) {
    this.requestorSelected = this.employees.find((c) => c.EmployeeID === this.anotherShipDetails.requestorID);
    this.requestorEmail = this.anotherShipDetails.email;
    this.serviceTypeSelected = this.serviceTypes.find((c) => c.id === this.anotherShipDetails.serviceTypeID);
    this.accountNumber = this.anotherShipDetails.accountNo;
    this.shipToInstructions = this.anotherShipDetails.instructions;

    this.recipientName = this.anotherShipDetails.recipientName;
    this.phoneNumber = this.anotherShipDetails.phoneNo;
    this.customerTypeID = this.anotherShipDetails.customerTypeID
    if(this.customerTypeID == 1) {
      this.customerOrVendor = 'Customer';
      this.customerSelected = this.customers.find((c) => c.CustomerID === this.anotherShipDetails.behalfID);
       customerVendorId = this.anotherShipDetails.behalfID;

    }
    else {
      this.customerOrVendor = 'Vendor';
      this.vendorSelected = this.vendors.find((v) => v.VendorID == this.anotherShipDetails.customerVendorID);
      customerVendorId = this.anotherShipDetails.customerVendorID;
    }
    this.shipToAddress1 = this.anotherShipDetails.address1;
    this.shipToAddress2 = this.anotherShipDetails.address2;
    this.shipToCity = this.anotherShipDetails.city;
    this.shipToState = this.anotherShipDetails.state;
    this.shipToZip = this.anotherShipDetails.zip;
    this.countrySelected = this.countries.find(c => c.countryName === this.anotherShipDetails.country)
    this.signatureEmployeeSelected = this.employees.find(c => c.EmployeeID === this.anotherShipDetails.approverID)

    this.approverId = this.anotherShipDetails.approverID == undefined ?  0 : this.anotherShipDetails.approverID;
    this.approvedById = this.anotherShipDetails.approvedBy == undefined ?  0 : this.anotherShipDetails.approvedBy;
    if(this.approvedById > 0){
      this.disabledAllBtns();
    }

    this.bindGridData(this.customerTypeID, customerVendorId);
  }
}

bindGridData(customerTypeId:number, customerVendorId:number) {
  this.apiService.getOtherInventoryLots(customerTypeId, customerVendorId).subscribe({
    next: (v: any) => {
       
      this.allLotNumbers = v; // Store the full list
      this.lotNumbers = [...this.allLotNumbers]; 

      this.lineItemsGrid = this.anotherShipDetails.anotherShipLineItems;
      this.lineItemsGrid.forEach((d, index) => {
       d.lotNumberSelected = this.allLotNumbers.find(e => e.id == d.inventoryID).name;
     })
    },
    error: (v: any) => { }
  });
}
private getOtherInventoryShipment(anotherShippingID:number) {
   
  if (!anotherShippingID) {
    return;
  }
  this.apiService.getOtherInventoryShipment(anotherShippingID).subscribe({
    next: (v: any) => {
       
      this.anotherShipDetails = v;
      this.bindData();
      // this.lineItemsGrid = v.anotherShipLineItem;
      // this.lineItemsGrid.forEach((d, index) => {
      //   d.lotNumberSelected = this.allLotNumbers.find(e => e.name == d.lotNumber);
      // })
    }
  });

}
upsertAnotherShipment(saveType:any){
  var otherShipID = 0;
  var recordStatus = 'I';
  if(this.appService.sharedData.anotherShipping.dataItem.anotherShipmentID) {
    otherShipID = this.appService.sharedData.anotherShipping.dataItem.anotherShipmentID;
    recordStatus = 'U';
  }

  const shipDetail : AnotherShipDetails = {
    ...INIT_ANOTHERSHIPDETAILS
  }

  shipDetail.anotherShipmentID = otherShipID;
  if(this.requestorSelected){
    shipDetail.requestorID = this.requestorSelected?.EmployeeID == undefined ? 0 : this.requestorSelected.EmployeeID;
  }
  else {
    this.appService.errorMessage('Please select requestor');
    return;
  }

  shipDetail.email = this.requestorEmail;
  if(this.serviceTypeSelected){
    shipDetail.serviceTypeID = this.serviceTypeSelected?.id == undefined ? 0 : this.serviceTypeSelected.id;
  }
  else {
    this.appService.errorMessage('Please select service type');
    return;
  }
  shipDetail.accountNo = this.accountNumber;
  if(this.recipientName){
    shipDetail.recipientName = this.recipientName;
  }
  else {
    this.appService.errorMessage('Please select recipient name');
    return;
  }
  if(this.phoneNumber){
    shipDetail.phoneNo = this.phoneNumber;
  }
  else {
    this.appService.errorMessage('Please select phone number');
    return;
  }

  if(this.customerOrVendor == "Customer") {
    shipDetail.customerTypeID = 1;
    if(this.customerSelected) {
      shipDetail.behalfID = this.customerSelected?.CustomerID == undefined ? 0 : this.customerSelected.CustomerID;
    }
    else {
      this.appService.errorMessage('Please select customer');
      return;
    }
  }
  else {
    shipDetail.customerTypeID = 0;
    if(this.vendorSelected) {
      shipDetail.customerVendorID = this.vendorSelected?.VendorID == undefined ? 0 : this.vendorSelected.VendorID;
    }
    else {
      this.appService.errorMessage('Please select Vendor');
      return;
    }
  }
  if(this.shipToAddress1){
    shipDetail.address1 = this.shipToAddress1;
  }
  else {
    this.appService.errorMessage('Please select address 1');
    return;
  }
  shipDetail.address2 = this.shipToAddress2;
  if(this.shipToCity){
    shipDetail.city = this.shipToCity;
  }
  else {
    this.appService.errorMessage('Please select city');
    return;
  }
  if(this.shipToState){
    shipDetail.state = this.shipToState;
  }
  else {
    this.appService.errorMessage('Please select state');
    return;
  }
  if(this.shipToZip){
    shipDetail.zip = this.shipToZip;
  }
  else {
    this.appService.errorMessage('Please select zip');
    return;
  }
  if(this.countrySelected){
    shipDetail.country = this.countrySelected?.countryName == undefined ? "" : this.countrySelected.countryName;
  }
  else {
    this.appService.errorMessage('Please select country');
    return;
  }
  shipDetail.instructions = this.shipToInstructions;
  shipDetail.status = "Active";
  shipDetail.recordStatus = recordStatus;
  shipDetail.userID = this.appService.loginId;
  shipDetail.anotherShipLineItems = [];
  if(saveType == 'Draft'){
    shipDetail.approverID = 0;
  }
  else if(saveType == 'sendForApproval') {
    
    if(this.signatureEmployeeSelected){
      shipDetail.approverID = this.signatureEmployeeSelected?.EmployeeID == undefined ? 0 : this.signatureEmployeeSelected.EmployeeID;
    }
    else{
      this.appService.errorMessage('Please select approver');
      return;
    }
  }
  else{
    shipDetail.approverID = this.approverId;
    shipDetail.approvedBy = this.appService.loginId;
  }
  debugger;
  this.lineItemsGrid.forEach((d, index) => {
     
    d.inventoryID = this.allLotNumbers.find(e => e.name == d.lotNumberSelected).id;
    shipDetail.anotherShipLineItems.push(d);
  })

  
  const shipDetailJson = JSON.stringify(shipDetail);

  this.apiService.upsertAntherShipment(shipDetailJson).subscribe({
    next : (v: any) => {
      debugger;
      this.onClose.emit();
      this.appService.successMessage(MESSAGES.DataSaved);
      //this.closeDialog();
    },
    error: (err) => {
      this.appService.errorMessage(MESSAGES.DataSaveError);
    }
  });
}

  addLineitemRow() {

    if(this.customerOrVendor == "Customer") {
      if(!this.customerSelected) {
        this.appService.errorMessage('Please select customer before adding line item');
        return;
      }
    }
    else {
      if(!this.vendorSelected) {
        this.appService.errorMessage('Please select Vendor before adding line item');
        return;
      }
    }

    const dataItem = this.appService.sharedData.anotherShipping.dataItem;
    this.lineItemsGrid.splice(0, 0, {
      ...INIT_OTHERSHIPPING_ITEM, recordStatus: "I"
    })
  }
  
  public selectedValues: string = "";
  
  employeesSelected: Employee[] = [];
  public gridStyle = {
    backgroundColor: 'green'
  };
  
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
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    // { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
    // { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
    { text: 'Remove', svgIcon: ICON.trashIcon },
  ];
  // rowActionMenuDevice: MenuItem[] = [
  //   { text: 'Edit Data', svgIcon: ICON.pencilIcon },
  //   { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
  //   { text: 'Remove', svgIcon: ICON.trashIcon },
  // ]

  onSelectRowActionMenu(e: ContextMenuSelectEvent, dataItem: any, rowIndex: number) {
    switch (e.item.text) {
      case 'Edit Data':
        dataItem.recordStatus = 'U'
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
  onOpenRowActionMenu(dateItem: any) {
    
    const remove = this.rowActionMenu.find(a => a.text == ActionType.Remove);
    const edit = this.rowActionMenu.find(a => a.text == ActionType.Edit);
    const v = this.rowActionMenu.find(a => a.text == ActionType.Void);

    this.rowActionMenu.forEach((i: any) => {
      i.disabled = false;
    });

    if (dateItem.lineItemID > 0) {
      if(edit)
        edit.disabled = false;
      if(v)
        v.disabled = false;
      if (remove) 
        remove.disabled = true;
    }
    else{
      if(edit)
        edit.disabled = true;
      if(v)
        v.disabled = true;
      if (remove) 
        remove.disabled = false;
    }
  }

  private doRemoveRow(rowIndex: number) {
    this.lineItemsGrid.splice(rowIndex, 1);
  }
  private doVoidData(r: any, rowIndex: number) {
    this.lineItemsGrid[rowIndex].status = 0;
    this.lineItemsGrid[rowIndex].recordStatus = "U";
  }
  private updateKeysToTitleCase(jsonObj: any) {
    const updatedObj: any = {};

    for (const key in jsonObj) {
      const updatedKey = key.charAt(0).toUpperCase() + key.slice(1);
      updatedObj[updatedKey] = jsonObj[key];
    }

    return updatedObj;
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
 
  onClearForm() {
    this.isFTZ = false;
    this.isInterim = false;
    this.expectedOrNot = 'Unexpected';

    this.customerTypeSelected = undefined
    this.customerSelected = undefined
    this.receiptLocationSelected = undefined
    this.behalfOfCusotmerSelected = undefined

    this.comments = '';
    this.deliveryModeSelected = undefined
    this.tracking = ''
    this.courierSelected = undefined
    this.countrySelected = undefined
    this.expectedDateTime = new Date();
    this.deliveryComments = ''

    this.addressSelected = undefined

    this.signatureEmployeeSelected = undefined
    this.signatureName = ''

    this.goodsTypeSelected = undefined
    this.address = ''
    
    this.contactPhone = ''
    this.contactPerson = ''
    this.employeesSelected = [];
  }
  private areThereAnyChanges() {
    debugger;
    return false;

    if (this.appService.sharedData.receiving.isViewMode || this.appService.sharedData.receiving.isEditMode) {
      return false
    } else {
      // new form
      const valuesToCheck = [
        this.customerTypeSelected,
        this.customerSelected,
        this.receiptLocationSelected,
        this.behalfOfCusotmerSelected,

        this.comments,
        this.deliveryModeSelected,
        this.tracking,
        this.courierSelected,
        this.countrySelected,
        this.deliveryComments,

        this.addressSelected,
        
        this.signatureEmployeeSelected,
        this.signatureName,

        this.address,
        
        this.contactPhone,
        this.contactPerson
      ]
      const hasTruthyValue = valuesToCheck.some(v => v);
      return hasTruthyValue
    }
  }
  fileRestrictions: FileRestrictions = {
    allowedExtensions: [".jpg", ".png", ".jpeg"],
    minFileSize: 1024 // in bytes , 1024*1024 1MB
  };
  onSelect(event: any): void {
    // Get selected files count
    console.log('Selected Files:', event.files);
  }

  onUpload(event: any): void {
    // Send selected files to API
    const formData = new FormData();
    event.files.forEach((file: any) => {
      formData.append('files', file.rawFile);
    });
    // Call API
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

  getServiceTypes() {

    this.apiService.getServiceTypes().subscribe({
      next: (v:any) => {
        this.serviceTypes = v;
      }
    });

  }

  onLotFilter(value: any): void {
    // Check if the filter input is empty
     
    if (value) {
        // Filter the allLotNumbers list based on the input
        this.lotNumbers = this.allLotNumbers.filter(lot =>
            lot.name.toLowerCase().includes(value.toLowerCase())
        );
    } else {
        // Reset to the full list when the input is cleared
        this.lotNumbers = [...this.allLotNumbers];
    }
  }
  getLotNumbers(customerTypeId:number, customerVendorId:number): void {
   
    this.apiService.getOtherInventoryLots(customerTypeId, customerVendorId).subscribe({
      next: (v: any) => {
         
        this.allLotNumbers = v; // Store the full list
        this.lotNumbers = [...this.allLotNumbers]; 
      },
      error: (v: any) => { }
    });
  }

  onCustomerVendorChanged() {
     
    var customerTypeId:number, customerVendorId:number = 0;

    if(this.customerOrVendor == "Customer") {
      customerTypeId = 1;
      if(this.customerSelected) {
        customerVendorId = this.customerSelected?.CustomerID == undefined ? 0 : this.customerSelected.CustomerID;
      }
    }
    else{
      customerTypeId = 0;
      if(this.vendorSelected) {
        customerVendorId = this.vendorSelected?.VendorID == undefined ? 0 : this.vendorSelected.VendorID;
      }
    }
    this.getLotNumbers(customerTypeId, customerVendorId);
  }

}
