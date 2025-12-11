import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { PDFExportComponent } from '@progress/kendo-angular-pdf-export';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { map, Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { INIT_ANOTHERSHIPDETAILS, AnotherShipDetails, INIT_OTHERSHIPPING_ITEM, AnotherShippingLineitem, KeyValueData, Address, Country, CourierDetails, Customer, CustomerType, DeliveryMode, DeviceItem, DeviceType, Employee, EntityType, GoodsType, HardwareItem, ICON, INIT_DEVICE_ITEM, INIT_HARDWARE_ITEM, INIT_MISCELLANEOUS_GOODS, INIT_POST_DEVICE, INIT_POST_RECEIPT, JSON_Object, LotCategory, MESSAGES, MiscellaneousGoods, PostDevice, PostHardware, PostMiscGoods, PostReceipt, ReceiptLocation, SignatureTypes, Vendor,CustomerAddress } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { CellClickEvent, GridComponent, GridDataResult,RowArgs  } from '@progress/kendo-angular-grid';
import { AddShippingAddressComponent } from '../add-shipping-address/add-shipping-address.component';

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
  styleUrls: ['./add-another-shipping.component.scss'],
  standalone: false
})
export class AddAnotherShippingComponent implements OnInit, OnDestroy {
  readonly ICON = ICON;
  //readonly TableType = TableType;
  @Output() onClose = new EventEmitter<void>();
  @Input() deliveryInfo:any | null;
  @ViewChild(AddShippingAddressComponent) shippingAddressComponent!: AddShippingAddressComponent;

  //readonly customerTypes: CustomerType[] = this.appService.masterData.customerType;
  //customerTypeSelected: CustomerType | undefined;
  //readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  //receiptLocationSelected: ReceiptLocation | undefined;
  //readonly goodsType: GoodsType[] = this.appService.masterData.goodsType;
  //goodsTypeSelected: GoodsType | undefined;
  //isDisabledGoodsType = false;
  //readonly deliveryMode: DeliveryMode[] = this.appService.masterData.deliveryMode;
  //deliveryModeSelected: DeliveryMode | undefined;

  //behalfOfCusotmerSelected: Customer | undefined;
  //behalfOfVendorSelected: Vendor | undefined;
  //contactPhone = '';
  //contactPerson = ''

  //name: string = '';
  //email: string = '';
  //comments: string = '';
  //deliveryComments: string = '';
  //address: any;
  //readonly addresses: Address[] = this.appService.masterData.addresses;
  //addressSelected: Address | undefined;
  
  
  //readonly couriers = this.appService.masterData.courierDetails
  //courierSelected: CourierDetails | undefined
  //readonly lotCategories = this.appService.masterData.lotCategory;
  //lotCategorySelected: LotCategory | undefined;
  //readonly deviceTypes = this.appService.masterData.deviceType;
  //deviceTypeSelected: DeviceType | undefined;
  // readonly lotIdentifiers = [
  //   { name: 'Test', id: 'Test' },
  //   { name: 'Test&Rel', id: 'Test&Rel' },
  //   { name: 'Rel', id: 'Rel' },
  //   { name: 'Customer Lot', id: 'Customer Lot' },
  //   { name: 'TBD', id: 'TBD' },
  // ]
  // lotIdentifierSelected: { name: string; id: string } | undefined;

  //description: string = '';

  // isHoldCheckboxEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
  //   featureField?.find(o => o.featureFieldName == 'HoldCheckbox')?.active ?? true;
  // isHoldCommentEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
  //   featureField?.find(o => o.featureFieldName == "HoldComments")?.active ?? true;

  //expectedOrNot: 'Expected' | 'Unexpected' = 'Expected'
  //isFTZ: boolean = false;
  //isInterim: boolean = false;
  isDisabled: any = {
    clearAnotherShipping: false,
    addAnotherShipping: false,
    addLineIem: false,
  }
  
  //tracking = ''
  
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
  addressDataResult: GridDataResult = { data: [], total: 0 };
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
  
  //expectedDateTime: Date = new Date();
  format = "MM/dd/yyyy HH:mm";
  public lineItemsGrid: AnotherShippingLineitem[] = [];
  isViewOrEdit:boolean = false;
  approverId:number=0;
  approvedById:number=0;
  

  constructor(public appService: AppService, private apiService: ApiService) { 
    this.getServiceTypes();
  }

  async ngOnInit(): Promise<void> {
    this.init();
    const user = this.employees.find(emp => emp.EmployeeID === this.appService.loginId);
    if (user) {
      this.requestorSelected = user;
      this.requestorEmail=user.EmployeeEmail;
    }
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
    
    if (this.appService.sharedData.anotherShipping.isViewMode || this.appService.sharedData.anotherShipping.isEditMode) {
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
onCustomerChange(selectedCustomer: any) {
  this.shippingAddressComponent.selectedShippingMethod=null;
  this.shippingAddressComponent.selectedCourier = null;
this.shippingAddressComponent.selectedDestination = null;
this.shippingAddressComponent.selectedContactPerson=null;
  if (selectedCustomer && selectedCustomer.CustomerID) {
    this.customerSelected = selectedCustomer;
    // this.getContactPersonDetails(this.customerSelected?.CustomerID ?? 0, null);
  } else {
    this.shippingAddressComponent.ContactPersonList = []; 
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
shipAlertEmailError: boolean = false;
shipAlertEmailMessage: string = "";
validateShipAlertEmail(): boolean {
  const inputValue = this.shippingAddressComponent.shippingDetailsData.ShipAlertEmail ? this.shippingAddressComponent.shippingDetailsData.ShipAlertEmail.trim() : "";
  if (!inputValue) return true; 
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const emailList = inputValue.split(/[,;\s]+/).filter(email => email.length > 0);
  for (const email of emailList) {
    if (!emailPattern.test(email)) {
      this.shipAlertEmailError = true;
      this.shipAlertEmailMessage = "Please enter valid Ship Alert Email Id(s) - Shipping Info.";
      return false;
    }
  }
  const uniqueEmails = new Set(emailList);
  if (uniqueEmails.size !== emailList.length) {
    this.shipAlertEmailError = true;
    this.shipAlertEmailMessage = "Duplicate Ship Alert Email Exist - Shipping Info.";
    return false;
  }
  return true;
}

onShipAlertEmailErrorClose(): void {
  this.shipAlertEmailError = false;
}
emailError: boolean = false;
  emailMessage: string = "";
  validateEmailOnSubmit(): boolean {
    const inputValue = this.shippingAddressComponent.shippingDetailsData.Email ? this.shippingAddressComponent.shippingDetailsData.Email.trim() : "";
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const multipleEmails = inputValue.includes(",") || inputValue.includes(";") || inputValue.split(" ").length > 1;
    if (!inputValue) {
      return true;
    }
    if (multipleEmails) {
      this.emailError = true;
      this.emailMessage = "Please enter valid Email Address - Shipping Info";
      return false;
    } else if (!emailPattern.test(inputValue)) {
      this.emailError = true;
      this.emailMessage = "Please enter valid Email Address - Shipping Info";
      return false;
    }
    return true; 
  }
  onemailErrorClose(): void {
    this.emailError = false;
  }
  onErrorClose(): void {
    this.onemailErrorClose();
  }
  totalValueError: boolean = false;
totalValueMessage: string = "";
validateTotalValue(): boolean {
  const totalValue = this.shippingAddressComponent.TotalValue ?? 0;
  if (totalValue > 50000) {
    this.totalValueError = true;
    this.totalValueMessage = "Total Value cannot be greater than 50,000.00. Please Check Unit Value and units.";
    return false;
  }
  return true;
}
onTotalValueErrorClose(): void {
  this.totalValueError = false;
}
unitValueError: boolean = false;
unitValueMessage: string = "";

validateUnitValue(): boolean {
  const unitValue = this.shippingAddressComponent.UnitValue ?? 0; 

  if (unitValue > 999999999.9999) {
    this.unitValueError = true;
    this.unitValueMessage = "Unit Value cannot be greater than 999999999.9999.";
    return false;
  }
  return true;
}
onUnitValueErrorClose(): void {
  this.unitValueError = false;
}
  
upsertAnotherShipment(saveType:any){
  const invalidQuantityItems = this.lineItemsGrid.filter(item =>
    item.quantity == null || isNaN(item.quantity) || item.quantity <= 0
  );

if (invalidQuantityItems.length > 0) {
    this.appService.errorMessage('Please enter valid Quantity for the line items.');
    return;
}
const invalidValueItems = this.lineItemsGrid.filter(item =>
  item.value== null 
);
if (invalidValueItems.length > 0) {
  this.appService.errorMessage('Please enter valid Value for the line items.');
  return;
}

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
    this.appService.errorMessage('Please select Delivery Method');
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
 
  if (!this.phoneNumber) {
    this.appService.errorMessage('Please enter phone number');
    return;
  }
  
  const isNumeric = /^\d+$/.test(this.phoneNumber);
  
  if (!isNumeric) {
    this.appService.errorMessage('Please enter a valid numeric phone number');
    return;
  }
  
  shipDetail.phoneNo = this.phoneNumber;
  
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
  if (!this.shippingAddressComponent.selectedShippingMethod?.masterListItemId) {
    this.appService.errorMessage('Please select ShippingMethod');
    return;
  } 
  if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1448) {
    if (!this.validateEmailOnSubmit()) {
      return; 
    }
    if (!this.validateShipAlertEmail()) {
      return; 
    }
    if (!this.shippingAddressComponent.shippingDetailsData.ContactPerson) {
      this.appService.errorMessage('Please enter contact person');
      return;
    } 
  }
  if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1447) {
    if (!this.validateShipAlertEmail()) {
      return; 
    }
  }
  if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1534) {
    if (!this.validateShipAlertEmail()) {
      return; 
    }
    if (!this.validateTotalValue()) {
      return; 
    }
    if (!this.validateUnitValue()) {
      return; 
    }
    if (!this.shippingAddressComponent.selectedCOO?.masterListItemId) {
      this.appService.errorMessage('Please select COO.');
      return;
    }

    if (!this.shippingAddressComponent.selectedCIFrom?.masterListItemId) {
      this.appService.errorMessage('Please select CI Form.');
      return;
    }
    if (!this.shippingAddressComponent.UnitValue) {
      this.appService.errorMessage('Please enter UnitValue.');
      return;
    }
  }
  if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1446) {
    if (!this.shippingAddressComponent.selectedDestination?.masterListItemId) {
      this.appService.errorMessage('Please select Destination.');
      return;
    }
    if (!this.shippingAddressComponent.selectedCourier?.masterListItemId) {
      this.appService.errorMessage('Please select Courier Name.');
      return;
    }
    if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 3) {
      if (!this.validateShipAlertEmail()) {
        return; 
      }
      if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
        this.appService.errorMessage('Please select Service Type.');
        return;
      }
      if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
        this.appService.errorMessage('Please select Bill Transportation To.');
        return;
      }
      if (!this.shippingAddressComponent.Courier.BillTransportationAcct) {
        this.appService.errorMessage('Please enter Trasportation Acct#.');
        return;
      }
    }

    if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 4) {
      if (!this.validateEmailOnSubmit()) {
        return; 
      }
      if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
        this.appService.errorMessage('Please select Bill Transportation To.');
        return;
      }
      if (!this.shippingAddressComponent.Courier.UPSAccountNumber) {
        this.appService.errorMessage('Please enter UPS Account Number.');
        return;
      }
      if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
        this.appService.errorMessage('Please select UPS Service.');
        return;
      }
    }
    if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 5) {
      if (!this.validateUnitValue()) {
        return; 
      }
      if (!this.shippingAddressComponent.selectedCIFrom?.masterListItemId) {
        this.appService.errorMessage('Please select CI Form.');
        return;
      }
      if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
        this.appService.errorMessage('Please select Service Type.');
        return;
      }
      if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
        this.appService.errorMessage('Please select Bill Transportation To.');
        return;
      }
      if (!this.shippingAddressComponent.Courier.BillTransportationAcct) {
        this.appService.errorMessage('Please enter Bill Trasportation Acct#.');
        return;
      }
      if (!this.shippingAddressComponent.selectedBillDutyTaxFeesTo?.itemText) {
        this.appService.errorMessage('Please select Bill Duties/taxes/fees.');
        return;
      }
      if (!this.shippingAddressComponent.Courier.Duties) {
        this.appService.errorMessage('Please enter Duties/taxes/fees Acc#.');
        return;
      }
      if (!this.shippingAddressComponent.selectedCOO?.masterListItemId) {
        this.appService.errorMessage('Please select COO.');
        return;
      }
      if (!this.shippingAddressComponent.UnitValue) {
        this.appService.errorMessage('Please enter UnitValue.');
        return;
      }
    }
    if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 6) {
      if (!this.validateUnitValue()) {
        return; 
      }
      if (!this.validateEmailOnSubmit()) {
        return; 
      }
      if (!this.validateTotalValue()) {
        return; 
      }
      if (!this.validateShipAlertEmail()) {
        return; 
      }
      if (!this.shippingAddressComponent.selectedCIFrom?.masterListItemId) {
        this.appService.errorMessage('Please select CI Form.');
        return;
      }
      if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
        this.appService.errorMessage('Please select Bill Transportation To.');
        return;
      }
      if (!this.shippingAddressComponent.selectedBillDutyTaxFeesTo?.itemText) {
        this.appService.errorMessage('Please select Bill Duties/taxes/fees.');
        return;
      }
      if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
        this.appService.errorMessage('Please select UPS Service.');
        return;
      }
      if (!this.shippingAddressComponent.Courier.UPSAccountNumber) {
        this.appService.errorMessage('Please enter UPS Account Number.');
        return;
      }
      if (!this.shippingAddressComponent.selectedCOO?.masterListItemId) {
        this.appService.errorMessage('Please select Country of Origin.');
        return;
      }
      if (!this.shippingAddressComponent.Quantity) {
        this.appService.errorMessage('Please enter Units.');
        return;
      }
      if (!this.shippingAddressComponent.UnitValue) {
        this.appService.errorMessage('Please enter UnitValue.');
        return;
      }
      if (!this.shippingAddressComponent.Courier.Height) {
        this.appService.errorMessage('Please enter Acct#.');
        return;
      }
    }
    if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 7) {
      if (!this.validateUnitValue()) {
        return; 
      }
      if (!this.validateShipAlertEmail()) {
        return; 
      }
      if (!this.shippingAddressComponent.selectedCIFrom?.masterListItemId) {
        this.appService.errorMessage('Please select CI Form.');
        return;
      }
      if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
        this.appService.errorMessage('Please select Product.');
        return;
      }
      if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
        this.appService.errorMessage('Please select Bill To.');
        return;
      }
      if (!this.shippingAddressComponent.Courier.BillTransportationAcct) {
        this.appService.errorMessage('Please enter Bill To Account.');
        return;
      }
      if (!this.shippingAddressComponent.selectedBillDutyTaxFeesTo?.itemText) {
        this.appService.errorMessage('Please select Bill Duties/taxes/fees.');
        return;
      }
      if (!this.shippingAddressComponent.Courier.Duties) {
        this.appService.errorMessage('Please enter Duties/taxes/fees Acc#.');
        return;
      }
      if (!this.shippingAddressComponent.selectedCOO?.masterListItemId) {
        this.appService.errorMessage('Please select Country of Origin.');
        return;
      }
      if (!this.shippingAddressComponent.selectedCommodityOrigin?.itemText) {
        this.appService.errorMessage('Please select Commodity Origin.');
        return;
      }
      if (!this.shippingAddressComponent.UnitValue) {
        this.appService.errorMessage('Please enter UnitValue.');
        return;
      }
    }
  }
  if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1447 || 
    this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1446 || 
    this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1534) {

  
  if (!this.shippingAddressComponent.address.Country) {
    this.appService.errorMessage('Please enter Country.');
    return;
  }

  if (!this.shippingAddressComponent.shippingDetailsData.ContactPerson) {
    this.appService.errorMessage('Please enter Contact Name.');
    return;
  }

  if (!this.shippingAddressComponent.address.CompanyName) {
    this.appService.errorMessage('Please enter Company Name.');
    return;
  }

  if (!this.shippingAddressComponent.address.Address1) {
    this.appService.errorMessage('Please enter Address 1.');
    return;
  }
  if (!this.shippingAddressComponent.address.Phone) {
    this.appService.errorMessage('Please enter Telephone.');
    return;
  }
  if (!this.shippingAddressComponent.address.State) {
    this.appService.errorMessage('Please enter State/Province.');
    return;
  }
  if (!this.shippingAddressComponent.address.City) {
    this.appService.errorMessage('Please enter City.');
    return;
  }
  if (!this.shippingAddressComponent.address.PostCode) {
    this.appService.errorMessage('Please enter PostCode.');
    return;
  }
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
  this.lineItemsGrid.forEach((d, index) => {
     
    d.inventoryID = this.allLotNumbers.find(e => e.name == d.lotNumberSelected).id;
    shipDetail.anotherShipLineItems.push(d);
  })
  const formattedPickUpDate = this.shippingAddressComponent.ExpectedPickUpDate ? this.shippingAddressComponent.ExpectedPickUpDate.toISOString().split('T')[0] : null;
  const PickUptime = this.shippingAddressComponent.shippingDetailsData.ExpectedTime;
  const formattedshipDate = this.shippingAddressComponent.ShipDate ? this.shippingAddressComponent.ShipDate.toISOString().split('T')[0] : null;
  const Shiptime = this.shippingAddressComponent.shippingDetailsData.ShippingTime; 
  const customerAddress: CustomerAddress = {
        ShippingMethodId:this.shippingAddressComponent.selectedShippingMethod.masterListItemId,
        IsForwarder: this.shippingAddressComponent.shippingDetailsData.Forwarder,  
        ContactPerson: this.shippingAddressComponent.shippingDetailsData.ContactPerson,
        Phone: this.shippingAddressComponent.address.Phone, 
        ShipAlertEmail: this.shippingAddressComponent.shippingDetailsData.ShipAlertEmail,
        ExpectedTime: (formattedPickUpDate && PickUptime) ? `${formattedPickUpDate} ${PickUptime}` : null,  
        Comments: this.shippingAddressComponent.address.Comments,  
        SpecialInstructionforShipping: this.shippingAddressComponent.address.SpecialInstructions,  
        PackingSlipComments: this.shippingAddressComponent.address.PackingComments,  
        CIComments: this.shippingAddressComponent.address.InvoiceComments,
        AddressId:this.shippingAddressComponent.address.addressId,  
        Email:this.shippingAddressComponent.shippingDetailsData.Email,
        Country:this.shippingAddressComponent.address.Country,
        CompanyName:this.shippingAddressComponent.address.CompanyName,
        Address1:this.shippingAddressComponent.address.Address1,
        Address2:this.shippingAddressComponent.address.Address2,
        Address3:this.shippingAddressComponent.address.Address3,
        Zip:this.shippingAddressComponent.address.PostCode,
        StateProvince:this.shippingAddressComponent.address.State,
        City:this.shippingAddressComponent.address.City,
        Extension:this.shippingAddressComponent.address.Ext,
        ShipDate:(formattedshipDate && Shiptime) ? `${formattedshipDate} ${Shiptime}` : null,
        CountryOfOrigin:this.shippingAddressComponent.selectedCOO?.itemText,
        CIFromId:this.shippingAddressComponent.selectedCIFrom?.masterListItemId,
        UnitValue:this.shippingAddressComponent.UnitValue,
        TotalValue:this.shippingAddressComponent.TotalValue,
        Units:this.shippingAddressComponent.Quantity,
        ECCN:this.shippingAddressComponent.shippingDetailsData.ECCN,
        ScheduleBNumber:this.shippingAddressComponent.ScheduleB,
        LicenseType:this.shippingAddressComponent.selectedLicense?.itemText,
        CommidityDescription:this.shippingAddressComponent.shippingDetailsData.CommodityDescription,
        UltimateConsignee:this.shippingAddressComponent.shippingDetailsData.UltimateConsignee,
        DestinationId:this.shippingAddressComponent.selectedDestination?.masterListItemId,
        CourierId:this.shippingAddressComponent.selectedCourier?.masterListItemId,
        ServiceType:this.shippingAddressComponent.selectedServiceType?.itemText,
        PackageType:this.shippingAddressComponent.Courier.PackageType,
        BillTransportationTo:this.shippingAddressComponent.selectedBillTransport?.itemText,
        BillTransportationAcct:this.shippingAddressComponent.Courier.BillTransportationAcct,
        CustomerReference:this.shippingAddressComponent.Courier.CustomerReference,
        NoOfPackages:this.shippingAddressComponent.Courier.NumberOfPackages,
        Weight:this.shippingAddressComponent.Courier.Weight,
        PackageDimentions:this.shippingAddressComponent.Courier.PackageDimension,
        IsResidential:this.shippingAddressComponent.Courier.Residential,
        AccountNumber:this.shippingAddressComponent.Courier.UPSAccountNumber,
        ReferenceNumber1:this.shippingAddressComponent.Courier.Length,
        ReferenceNumber2:this.shippingAddressComponent.Courier.Width,
        OtherAccountNumber:this.shippingAddressComponent.Courier.Height,
        TaxId:this.shippingAddressComponent.Courier.Taxid,
        Attention:this.shippingAddressComponent.Courier.Attention,
        InvoiceNumber:this.shippingAddressComponent.Courier.InvoiceNumber,
        BillDutyTaxFeesTo:this.shippingAddressComponent.selectedBillDutyTaxFeesTo?.itemText,
        BillDutyTaxFeesAcct:this.shippingAddressComponent.Courier.Duties,
        CommodityDescription:this.shippingAddressComponent.shippingDetailsData.CommodityDescription,
        ScheduleBUnits1:this.shippingAddressComponent.Courier.ScheduleBUnits1,
        PurchaseNumber:this.shippingAddressComponent.Courier.PurchaseNumber,
        ShipmentReference:this.shippingAddressComponent.shippingDetailsData.Height,
        CustomsTermsOfTradeId:this.shippingAddressComponent.selectedCustomeTT?.masterListItemId, 
        Qty:this.shippingAddressComponent.Courier.Qty,
        CommodityOrigin:this.shippingAddressComponent.selectedCommodityOrigin?.itemText,
        BillToCountry:this.shippingAddressComponent.billToAddress.Country,
        BillToContactPerson:this.shippingAddressComponent.billToAddress.ContactPerson,
        BillToCompanyName:this.shippingAddressComponent.billToAddress.CompanyName,
        BillToAddress1:this.shippingAddressComponent.billToAddress.Address1,
        BillToAddress2:this.shippingAddressComponent.billToAddress.Address2,
        BillToAddress3:this.shippingAddressComponent.billToAddress.Address3,
        BillToPhone:this.shippingAddressComponent.billToAddress.TelePhone,
        BillToStateProvince:this.shippingAddressComponent.billToAddress.State,
        BillToCity:this.shippingAddressComponent.billToAddress.City,
        BillToZip:this.shippingAddressComponent.billToAddress.PostCode,
        BillToExtension:this.shippingAddressComponent.billToAddress.Ext,
        CustomerBillTOAddressId:this.shippingAddressComponent.billToAddress.billtoaddressId,
        BillCheck:this.shippingAddressComponent.sameAsShipTo,
        RejectLocationId:this.shippingAddressComponent.selectedRejectLocation?.masterListItemId
      };
       shipDetail.CustomerAddress = [customerAddress];
  const shipDetailJson = JSON.stringify(shipDetail);
  this.apiService.upsertAntherShipment(shipDetailJson).subscribe({
    next : (v: any) => {
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
    { text: 'Remove', svgIcon: ICON.trashIcon },
  ];

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
    // this.isFTZ = false;
    // this.isInterim = false;
    // this.expectedOrNot = 'Unexpected';

    //this.customerTypeSelected = undefined
    this.customerSelected = undefined
    //this.receiptLocationSelected = undefined
    //this.behalfOfCusotmerSelected = undefined

    //this.comments = '';
    //this.deliveryModeSelected = undefined
    //this.tracking = ''
    //this.courierSelected = undefined
    this.countrySelected = undefined
    //this.expectedDateTime = new Date();
    //this.deliveryComments = ''

    //this.addressSelected = undefined

    this.signatureEmployeeSelected = undefined
    this.signatureName = ''

    //this.goodsTypeSelected = undefined
    //this.address = ''
    
    //this.contactPhone = ''
    //this.contactPerson = ''
    this.employeesSelected = [];
  }
  private areThereAnyChanges() {
    return false;

    if (this.appService.sharedData.receiving.isViewMode || this.appService.sharedData.receiving.isEditMode) {
      return false
    } else {
      // new form
      const valuesToCheck = [
        //this.customerTypeSelected,
        this.customerSelected,
        //this.receiptLocationSelected,
        //this.behalfOfCusotmerSelected,

        //this.comments,
        //this.deliveryModeSelected,
        //this.tracking,
        //this.courierSelected,
        this.countrySelected,
        //this.deliveryComments,

        //this.addressSelected,
        
        this.signatureEmployeeSelected,
        this.signatureName,

        //this.address,
        
        //this.contactPhone,
        //this.contactPerson
      ]
      const hasTruthyValue = valuesToCheck.some(v => v);
      return hasTruthyValue
    }
  }
  // fileRestrictions: FileRestrictions = {
  //   allowedExtensions: [".jpg", ".png", ".jpeg"],
  //   minFileSize: 1024 // in bytes , 1024*1024 1MB
  // };
  // onSelect(event: any): void {
  //   // Get selected files count
  //   console.log('Selected Files:', event.files);
  // }

  // onUpload(event: any): void {
  //   // Send selected files to API
  //   const formData = new FormData();
  //   event.files.forEach((file: any) => {
  //     formData.append('files', file.rawFile);
  //   });
  //   // Call API
  // }
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
  getTotalValue(): number {
    return this.lineItemsGrid.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
  }

}
