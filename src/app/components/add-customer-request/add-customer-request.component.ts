import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { CustomerService } from '../../services/customer.service';  // Adjust the path as necessary
import { CellClickEvent, GridComponent, GridDataResult,RowArgs  } from '@progress/kendo-angular-grid';
import { CustomerOrder, OrderRequest,CustomerAddress } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ICON, MESSAGES, Customer } from 'src/app/services/app.interface';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-customer-request',
  templateUrl: './add-customer-request.component.html',
  styleUrls: ['./add-customer-request.component.scss']
})
export class AddCustomerRequestComponent implements OnInit {
  readonly ICON = ICON
  @Input() isEditMode: boolean = true;  // Use this flag to control view/edit mode
  @Input() addCustomerMode: boolean = false;  // Use this flag to control view/edit mode
  @Output() customerAdded = new EventEmitter<void>();
  @Input() customerOrd: any;  // Receive the customer order data
  @Input() formOrdData:any;
  @Input() deliveryInfo:any | null;
  @ViewChild('grid', { static: true }) grid!: GridComponent; 
  gridDataResult: GridDataResult = { data: [], total: 0 };
  addressDataResult: GridDataResult = { data: [], total: 0 };
  customer: Customer[] = []
  customerSelected: Customer | undefined;
  deviceTypes: string[] = ['Device', 'Hardware','Miscellaneous Goods','All'];  // Array to hold device types
  customerOrderTypes: string[] = ['Finished Goods', 'WIP', 'Scrap']; 
  customerOrderTypeSelected:string='Finished Goods';
  deviceTypeSelected: string = 'All';  // Variable to hold the selected device type
  lotNumber: string | null = null;  // Lot number
  lotNumbers: string[] = [];

  selectedShippingMethod: any = null;
  selectedCOO: any = null;
  selectedCIFrom: any = null;
  selectedLicense: any = null;
  selectedCourier: any = null;
  selectedDestination: any = null;
  selectedServiceType: any = null;
  selectedBillTransport: any = null;
  selectedBillDutyTaxFeesTo: any = null;
  selectedCourierCIFrom: any = null;
  selectedUPSService: any = null;
  selectedCustomeTT: any = null;
  selectedCommodityOrigin: any = null;
  shippingMethods: any[] = [];
  COOList: any[] = [];
  CIFromList: any[] = []; 
  LicenseList: any[] = [];
  destinationList: any[] = [];
  serviceTypeList: any[] = [];
  billTransportList: any[] = []; 
  courierList: any[] = [];
  CourierCIFromList: any[] = [];
  UPSServiceList: any[] = [];
  CustomeTTList: any[] = [];  
  dialogVisible: boolean = false;
  selectedAddresses: any[] = [];
  gridData: any[] = []; 
  selectedItems: any[] = [];
  times: any[] = this.generateTimes();
  Quantity:number | undefined;
  UnitValue: number| undefined;
  TotalValue:number| undefined;
  ScheduleB:number| undefined;
  Height:number| undefined;
  format: string = 'yyyy-MM-dd';
  ExpectedPickUpDate:Date | null = null;
  ShipDate:Date | null = null;


  allLotNumbers: string[] = []; // F
  // below code can be changed/removed
  selectedRows: any[] = []; 
  selectedcheckBoxs: Set<number> = new Set<number>();
  public columns: any[] = [];
  public addressDataResultcolumns: any[] = [];  // Array to hold column configurations
  // Create an EventEmitter to emit the cancel event to the parent
  @Output() cancel = new EventEmitter<void>();
 
  //public selectedRecords: any[] = []; // Array to track selected records
  public selectableSettings = { checkboxOnly: true, mode: 'multiple' };
  public selectedRecords: Set<any> = new Set<any>(); // Use Set to track unique selected records
  public formData : any = {}; 
  
  constructor(private customerService: CustomerService, public appService: AppService, private apiService: ApiService) { }
  shippingDetailsData = {
    Email: '',
    ShipAlertEmail: '',
    ContactPerson: '',
    Destination: '',
    CourierName: '',
    CIFrom: '',
    ServiceType: '',
    BillTransportTo: '',
    BillTransportAcct: '',
    CustomerReference: '',
    InvoiceNumber: '',
    BillDutiesTaxes: '',
    DutiesTaxes: '',
    ECCN: '',
    CIAdditionalInfo: '',
    ShipAlertEmailCourier: '',
    Weight:'',
    Width:'',
    Length:'',
    Attention:'',
    PackageType:'',
    Residential:'',
    NoOfPackages:'',
    PackageDimension:'',
    CIFromId:'',
    AccountNumber:'',
    Height:'',
    TaxId:'',
    HoldShip:'',
    Forwarder:false,
    Phone:'',
    LicenseException:'',
    LicenseType:'',
    Units:'',
    PurchaseNo:'',
    DescriptionOfGood:'',
    Product:'',
    CommodityOrgin:'',
    ShipmentReference:'',
    CustomTermTrade:'',
    UltimateConsignee:'',
    ShippingTime:'',
    ExpectedTime:'',
    CommodityDescription:''
  };
  address = {
    addressId:0,
    Country: '',
    ReceiversName: '',
    CompanyName: '',
    Address1: '',
    Address2: '',
    Address3: '',
    Phone: '',
    State: '',
    City: '',
    PostCode: '',
    Ext: '',
    Comments:'',
    SpecialInstructions:'',
    PackingComments:'',
    InvoiceComments:'',
    contactPerson:''
  };
  Courier={
    scheduledB:'',
    billAccount:'',
    invoiceNumber:0,
    BillTransportationAcct:'',
    TrasportationAcct:'',
    CustomerReference:'',
    NumberOfPackages:'',
    Weight:null as number | null,
    PackageDimension:'',
    Residential:false,
    UPSAccountNumber:'',
    Length:'',
    Width:'',
    Height:null as number | null,
    Taxid:'',
    Attention:'',
    PackageType:'',
    InvoiceNumber:'',
    Duties:'',
    BillDutyTaxFeesAcct:'',
    PurchaseNumber:'',
    ScheduleBUnits1:null as number | null,
    Qty:null as number | null,

  }
  

  async ngOnInit(): Promise<void> {
    this.formData.OQA = false;   // Initialize OQA as false
    this.formData.Bake = false;  // Initialize Bake as false
    this.formData.PandL = false; // Initialize P&L as false
    this.formData.CustomerId=null;
    this.customer = this.appService.masterData.entityMap.Customer;
    this.formData.customerOrderTypeSelected=this.customerOrderTypeSelected;
    await this.getMasterListItems('ShippingMethod', null);
    await this.getCOOListItems('CountryOfOrigin',null);
    await this.getCIFromListItems('CIFrom',null);
    await this.getLicensListItems('LicenseType',null);
    await this.getbillTransportListItems('BillTransportationTo',null);
    await this.getCustomeTTListItems('CustomsTermsofTrade',null);
    await this.getserviceTypeListItems('ServiceType',null);

    this.initializeColumns();
    if (!this.addCustomerMode && this.customerOrd && this.customerOrd.length > 0) {
      this.gridDataResult.data = this.customerOrd;
      this.formData=this.formOrdData;
      this.initializeSelectedRows();
      if (this.deliveryInfo) {
        this.ExpectedPickUpDate = this.deliveryInfo[0]?.expectedTime? new Date(new Date(this.deliveryInfo[0].expectedTime.split('T')[0]).getTime() + new Date().getTimezoneOffset() * 60000) : null;
        this.ShipDate = this.deliveryInfo[0]?.shipDate? new Date(new Date(this.deliveryInfo[0].shipDate.split('T')[0]).getTime() + new Date().getTimezoneOffset() * 60000) : null;

        this.selectedShippingMethod = {};
        this.selectedShippingMethod.masterListItemId = this.deliveryInfo[0]?.shippingMethodId || '';
        this.selectedShippingMethod.itemText = this.deliveryInfo[0]?.shippingMethod||'';

        this.selectedCIFrom = {};
        this.selectedCIFrom.masterListItemId = this.deliveryInfo[0]?.ciFromId||'';
        this.selectedCIFrom.itemText = this.deliveryInfo[0]?.ciFrom||'';

        this.selectedCOO = {};//need to check
        if(this.COOList.length>0){
          this.selectedCOO = this.COOList.find(a=>a.itemText == this.deliveryInfo[0]?.countryOfOrigin)
        }

        this.selectedLicense={};//need to check
        if(this.LicenseList.length>0){
          this.selectedLicense = this.LicenseList.find(a=>a.itemText == this.deliveryInfo[0]?.licenseType)
        }
        this.selectedLicense={};//need to check
        if(this.LicenseList.length>0){
          this.selectedLicense = this.LicenseList.find(a=>a.itemText == this.deliveryInfo[0]?.licenseType)
        }
        this.selectedCommodityOrigin={};//need to check
        if(this.COOList.length>0){
          this.selectedCommodityOrigin = this.COOList.find(a=>a.itemText == this.deliveryInfo[0]?.commodityOrigin)
        }
        this.selectedCustomeTT={};
        this.selectedCustomeTT.masterListItemId = this.deliveryInfo[0]?.customsTermsOfTradeId||'';
        this.selectedCustomeTT.itemText = this.deliveryInfo[0]?.customsTermsOfTrade||'';

        this.selectedDestination = {};
        this.selectedDestination.masterListItemId = this.deliveryInfo[0]?.destinationId || '';
        this.selectedDestination.itemText = this.deliveryInfo[0]?.destination||'';

        this.selectedCourier = {};
        this.selectedCourier.masterListItemId = this.deliveryInfo[0]?.courierId || '';
        this.selectedCourier.itemText = this.deliveryInfo[0]?.courier||'';

        this.selectedServiceType = {};//need to check
        if(this.serviceTypeList.length>0){
          this.selectedServiceType = this.serviceTypeList.find(a=>a.itemText == this.deliveryInfo[0]?.serviceType)
        }

        this.selectedBillTransport = {};//need to check
        if(this.billTransportList.length>0){
          this.selectedBillTransport = this.billTransportList.find(a=>a.itemText == this.deliveryInfo[0]?.billTransportationTo)
        }

        this.selectedBillDutyTaxFeesTo = {};//need to check
        if(this.billTransportList.length>0){
          this.selectedBillDutyTaxFeesTo = this.billTransportList.find(a=>a.itemText == this.deliveryInfo[0]?.billDutyTaxFeesTo)
        }

        this.ScheduleB = this.deliveryInfo[0]?.scheduleBNumber;
        this.Quantity = this.deliveryInfo[0]?.units;
        this.TotalValue=this.deliveryInfo[0]?.totalValue;
        this.UnitValue=this.deliveryInfo[0]?.unitValue;
        this.shippingDetailsData = {
          Email: this.deliveryInfo[0]?.email || '',
          ShipAlertEmail: this.deliveryInfo[0]?.shipAlertEmail || '',
          ContactPerson: this.deliveryInfo[0]?.contactPerson || '',
          Destination: this.deliveryInfo[0]?.destination || '',//leave
          CourierName: this.deliveryInfo[0]?.courierName || '',//leave
          CIFrom: this.deliveryInfo[0]?.ciFrom || '',//leave
          ServiceType: this.deliveryInfo[0]?.serviceType || '',//leave
          BillTransportTo: this.deliveryInfo[0]?.billTransportTo || '',//leave
          BillTransportAcct: this.deliveryInfo[0]?.billTransportAcct || '',//leave
          CustomerReference: this.deliveryInfo[0]?.customerReference || '',//leave
          InvoiceNumber: this.deliveryInfo[0]?.invoiceNumber || '',//leave
          BillDutiesTaxes: this.deliveryInfo[0]?.billDutiesTaxes || '',//leave
          DutiesTaxes: this.deliveryInfo[0]?.dutiesTaxes || '',//leave
          ECCN: this.deliveryInfo[0]?.eccn || '',
          CIAdditionalInfo: this.deliveryInfo[0]?.ciAdditionalInfo || '',//leave
          ShipAlertEmailCourier: this.deliveryInfo[0]?.shipAlertEmailCourier || '',//leave
          Weight: this.deliveryInfo[0]?.weight || '',//leave
          Width: this.deliveryInfo[0]?.width || '',//leave
          Length: this.deliveryInfo[0]?.length || '',//leave
          Attention: this.deliveryInfo[0]?.attention || '',//leave
          PackageType: this.deliveryInfo[0]?.packageType || '',//leave
          Residential: this.deliveryInfo[0]?.residential || '',//leave
          NoOfPackages: this.deliveryInfo[0]?.noOfPackages || '',//leave
          PackageDimension: this.deliveryInfo[0]?.packageDimension || '',//leave
          CIFromId: this.deliveryInfo[0]?.ciFromId || '',//leave
          AccountNumber: this.deliveryInfo[0]?.accountNumber || '',//leave
          Height: this.deliveryInfo[0]?.shipmentReference || '',
          TaxId: this.deliveryInfo[0]?.taxId || '',//leave
          HoldShip: this.deliveryInfo[0]?.holdShip || '',
          Forwarder: this.deliveryInfo[0]?.isForwarder || false,

          ExpectedTime: this.deliveryInfo[0]?.expectedTime ? this.deliveryInfo[0].expectedTime.slice(11, 16) : '',
          ShippingTime: this.deliveryInfo[0]?.shipDate ? this.deliveryInfo[0].shipDate.slice(11, 16) : '',

          Phone: this.deliveryInfo[0]?.phone || '',//leave
          LicenseException: this.deliveryInfo[0]?.licenseException || '',//leave
          LicenseType: this.deliveryInfo[0]?.licenseType || '',//leave
          Units: this.deliveryInfo[0]?.units || '',//leave
          PurchaseNo: this.deliveryInfo[0]?.purchaseNo || '',//leave
          DescriptionOfGood: this.deliveryInfo[0]?.descriptionOfGood || '',//leave
          Product: this.deliveryInfo[0]?.product || '',//leave
          CommodityOrgin: this.deliveryInfo[0]?.commodityOrgin || '',//leave
          ShipmentReference: this.deliveryInfo[0]?.shipmentReference || '',//leave
          CustomTermTrade: this.deliveryInfo[0]?.customTermTrade || '',//leave
          UltimateConsignee: this.deliveryInfo[0]?.ultimateConsignee || '',
          CommodityDescription: this.deliveryInfo[0]?.commodityDescription || ''
        };
        this.address = {
          addressId: this.deliveryInfo[0]?.customerAddressId || 0,
          Country: this.deliveryInfo[0]?.country || '',
          ReceiversName: this.deliveryInfo[0]?.receiverName || '',//leave
          CompanyName: this.deliveryInfo[0]?.companyName || '',
          Address1: this.deliveryInfo[0]?.address1 || '',
          Address2: this.deliveryInfo[0]?.address2 || '',
          Address3: this.deliveryInfo[0]?.address3 || '',
          Phone: this.deliveryInfo[0]?.phone || '',
          State: this.deliveryInfo[0]?.stateProvince || '',
          City: this.deliveryInfo[0]?.city || '',
          PostCode: this.deliveryInfo[0]?.postCode || '',
          Ext: this.deliveryInfo[0]?.ext || '',
          Comments: this.deliveryInfo[0]?.shippingComments || '',
          SpecialInstructions: this.deliveryInfo[0]?.specialInstructionforShipping || '',
          PackingComments: this.deliveryInfo[0]?.commentsforPackingSlip || '',
          InvoiceComments: this.deliveryInfo[0]?.commentsforCommericalInvoice || '',
          contactPerson: this.deliveryInfo[0]?.contactPerson || ''
        };
        this.Courier = {
          scheduledB: this.deliveryInfo[0]?.scheduleBNumber || '',
          billAccount: this.deliveryInfo[0]?.billAccount || '',//leave
          invoiceNumber: this.deliveryInfo[0]?.invoiceNumber || 0,
          BillTransportationAcct: this.deliveryInfo[0]?.billTransportationAcct || '',
          TrasportationAcct: this.deliveryInfo[0]?.trasportationAcct || '',//leave
          CustomerReference: this.deliveryInfo[0]?.customerReference || '',
          NumberOfPackages: this.deliveryInfo[0]?.noOfPackages || '',
          Weight: this.deliveryInfo[0]?.weight || 0,
          PackageDimension: this.deliveryInfo[0]?.packageDimentions || '',
          Residential: this.deliveryInfo[0]?.residential || false,
          UPSAccountNumber: this.deliveryInfo[0]?.accountNumber || '',
          Length: this.deliveryInfo[0]?.referenceNumber1 || '',
          Width: this.deliveryInfo[0]?.referenceNumber2 || '',
          Height: this.deliveryInfo[0]?.otherAccNo || 0,
          Taxid: this.deliveryInfo[0]?.taxId || '',
          Attention: this.deliveryInfo[0]?.attention || '',
          PackageType: this.deliveryInfo[0]?.packageType || '',
          InvoiceNumber: this.deliveryInfo[0]?.invoiceNumber || '',
          Duties: this.deliveryInfo[0]?.billDutyTaxFeesAcct || '',
          BillDutyTaxFeesAcct: this.deliveryInfo[0]?.billDutyTaxFeesAcct || '',//leave
          PurchaseNumber: this.deliveryInfo[0]?.purchaseNumber || '',
          ScheduleBUnits1: this.deliveryInfo[0]?.scheduleBUnits1 || 0,
          Qty: this.deliveryInfo[0]?.qty || 0
        };
            
      }
      
     
    }

    this.getLotNumbers();
    this.getDestinationListItems('Destination',null);
    this.getCourierNameListItems('Courier',null);
    this.getCourierCIFromListItems('CIFrom',null);
    
   
  }
  
  calculateTotalValue(): void {
    this.TotalValue = parseFloat(((this.Quantity || 0) * (this.UnitValue || 0)).toFixed(1));
  }
  
  showPopup: boolean = false;
  currentInvalidField: any = null;
  validateNumericInput(event: any): void {
    const inputValue = event.target.value;

    if (inputValue && isNaN(Number(inputValue))) {
      this.showPopup = true;
      this.currentInvalidField = event.target; 
    }
  }
  
  onPopupClose(): void {
    if (this.currentInvalidField) {
      this.currentInvalidField.value = ''; 
    }
    this.showPopup = false;
  }
  onClose(): void {
    this.onPopupClose();
  }

  showMsg: boolean = false;
  popupMessage: string = "";
validateWeightInput(event: any): void {
  let inputValue = event.target.value;
  inputValue = inputValue.replace(/[^0-9.]/g, '');
  const decimalCount = (inputValue.match(/\./g) || []).length;
  if (decimalCount > 1) {
    inputValue = inputValue.substring(0, inputValue.lastIndexOf('.'));
  }
  const numericValue = parseFloat(inputValue);
  if (isNaN(numericValue)) {
    this.showMsg = true;
    this.popupMessage = "Please enter decimal values.";
  } else if (numericValue > 999.99) {
    this.showMsg = true;
    this.popupMessage = "Value cannot be greater than 999.99.";
  } else {
    this.showMsg = false;
    this.popupMessage = "";
  }
  this.Courier.Weight = inputValue;
}
showMsgClose(): void {
  this.showMsg = false;
  this.Courier.Weight=null;
}
onCloseMsg(): void {
  this.showMsgClose();
}

emailError: boolean = false;
emailMessage: string = "";
validateEmailOnSubmit(): boolean {
  const inputValue = this.shippingDetailsData.Email ? this.shippingDetailsData.Email.trim() : "";
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
  const totalValue = this.TotalValue ?? 0;
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
shipAlertEmailError: boolean = false;
shipAlertEmailMessage: string = "";

validateShipAlertEmail(): boolean {
  const inputValue = this.shippingDetailsData.ShipAlertEmail ? this.shippingDetailsData.ShipAlertEmail.trim() : "";
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
unitValueError: boolean = false;
unitValueMessage: string = "";

// Validate Unit Value
validateUnitValue(): boolean {
  const unitValue = this.UnitValue ?? 0; // Default to 0 if undefined

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
onShippingMethodChange(): void {
  this.selectedCourier = null;
  this.selectedDestination = null;
}
  generateTimes(): any[] {
    const times = [];
    let hours = 0;
    let minutes = 0;

    while (hours < 24) {
      const hour = hours < 10 ? '0' + hours : hours;
      const minute = minutes < 10 ? '0' + minutes : minutes;
      var time = {text:`${hour}:${minute}`};
      times.push(time);
      minutes += 15;
      if (minutes === 60) {
        minutes = 0;
        hours++;
      }
    }
    return times;
  }
  openDialog() {
    var a = this.customerSelected?.CustomerID || null;
    if (a === null) {
      this.appService.errorMessage('Please select a customer.');
      this.dialogVisible = false;
      return;
    } 
    let isDomestic = false;
    let courierId =  null;  
   
    if (this.selectedShippingMethod?.masterListItemId == 1446) {
       isDomestic = this.selectedDestination?.masterListItemId === 1;
       courierId = this.selectedCourier?.masterListItemId || null; 
      if (!this.selectedCourier?.masterListItemId) {
        this.appService.errorMessage('Please select courier name - Shipping Info');
        this.dialogVisible = false;
        return;
      }
    }
    this.loadShippingAddresses(a, false, null, courierId, isDomestic);
        this.dialogVisible = true;
  }
  
  
  loadShippingAddresses(customerId: number| null, isBilling: boolean, vendorId: number | null, courierId: number | null, isDomestic: boolean) {
    this.addressDataResult.data = [];
    this.addressDataResult.total = 0;
    this.apiService.getShippingAddressData(customerId, isBilling, vendorId, courierId, isDomestic).subscribe({
      next: (data: any[]) => {
        this.addressDataResult.data = data;
        if (this.address && this.address.addressId) {
          const selectedAddress = this.addressDataResult.data.find((address: any) => address.addressId === this.address.addressId);
          if (selectedAddress) {
            this.onRadioChange(selectedAddress);
          }
        }
      },
      error: (error) => {
        console.error('Error fetching child grid data:', error);
      }
    });
  }

  onSelectionChanges(event: any) {
    this.selectedAddresses = event.selectedRows.map((row: any) => row.dataItem);
    if (this.selectedAddresses.length > 0) {
      this.address = { ...this.selectedAddresses[0] }; 
    }
  }
  
  tempSelectedAddress: any = null;  
  onRadioChange(dataItem: any) {
    this.tempSelectedAddress = dataItem;
  }

 closeDialog() {
  this.dialogVisible = false;
 }
 onOk() {
  if (this.tempSelectedAddress) {
    this.address = {
      ...this.address,
      addressId: this.tempSelectedAddress.addressId,
      Country: this.tempSelectedAddress.country,
      contactPerson: this.tempSelectedAddress.contactPerson,
      CompanyName: this.tempSelectedAddress.companyName,
      Address1: this.tempSelectedAddress.address1,
      Address2: this.tempSelectedAddress.address2,
      Address3: this.tempSelectedAddress.address3,
      Phone: this.tempSelectedAddress.phone,
      State: this.tempSelectedAddress.state,
      City: this.tempSelectedAddress.city,
      PostCode: this.tempSelectedAddress.zip,
      Ext: this.tempSelectedAddress.extension,
      Comments: '',   
      SpecialInstructions: '',   
      PackingComments: '',   
      InvoiceComments: ''
    };
    this.shippingDetailsData.ContactPerson = this.tempSelectedAddress.contactPerson;
    this.closeDialog(); 
  } else {
    this.appService.errorMessage('Please select at least one address');
    return;
  }
}

  onCancel() {
    this.closeDialog();
  }
  async getMasterListItems(listName: string, serviceId: number | null){
    this.shippingMethods = await new Promise<any>((resolve, reject) => { 
      this.apiService.getMasterListItems(listName, serviceId).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
  }
  async getCOOListItems(listName: string, serviceId: number | null){
    this.COOList = await new Promise<any>((resolve, reject) => { 
      this.apiService.getMasterListItems(listName, serviceId).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
  }
  async getCIFromListItems(listName: string, parentId: number | null){
    this.CIFromList = await new Promise<any>((resolve, reject) => { 
      this.apiService.getListItems(listName, parentId).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
  }
  async getLicensListItems(listName: string, parentId: number | null){
    this.LicenseList = await new Promise<any>((resolve, reject) => { 
      this.apiService.getListItems(listName, parentId).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
  }
  async getserviceTypeListItems(listName: string, parentId: number | null){
    this.serviceTypeList = await new Promise<any>((resolve, reject) => { 
      this.apiService.getListItems(listName, parentId).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
  }
  async getbillTransportListItems(listName: string, parentId: number | null){
    this.billTransportList = await new Promise<any>((resolve, reject) => { 
      this.apiService.getListItems(listName, parentId).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
  }
  async getCustomeTTListItems(listName: string, parentId: number | null){
    this.CustomeTTList = await new Promise<any>((resolve, reject) => { 
      this.apiService.getListItems(listName, parentId).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
  }
  async getDestinationListItems(listName: string, parentId: number | null){
    this.destinationList = await new Promise<any>((resolve, reject) => { 
      this.apiService.getListItems(listName, parentId).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
  }
  getCourierNameListItems(listName: string, parentId: number | null): void {
    this.apiService.getListItems(listName, parentId).subscribe({
      next: (data: any) => {
        if (this.selectedDestination?.itemText === 'International') {
          const courierListt = data.filter((item: { parent: number; }) => item.parent === 2);
          const selectOption = { itemText: 'Select', masterListItemId: null };
          this.courierList = [selectOption, ...courierListt];
        } else if (this.selectedDestination?.itemText === 'Domestic') {
          const courierListt = data.filter((item: { parent: number; }) => item.parent === 1);
          const selectOption = { itemText: 'Select', masterListItemId: null };
          this.courierList = [selectOption, ...courierListt];
        } else if (this.selectedDestination?.itemText === 'Select') {
          this.courierList = [{ itemText: 'Select', masterListItemId: null }];
        }
        else {
          this.courierList = [{ itemText: 'Select', masterListItemId: null }];
        }
      },
      error: (error: any) => {
        this.appService.errorMessage('Failed to fetch Courier list items.');
      }
    });
  }
  async onCourierChange(event: any): Promise<void> {
    if (this.selectedCourier?.masterListItemId) {
      await this.getserviceTypeListItems('ServiceType',this.selectedCourier?.masterListItemId);
    }
    else {
      this.serviceTypeList = [];
    }
  }
  
  onDestinationChange(event: any): void {
    if (event) {
      this.getCourierCIFromListItems('CIFrom', null);
      this.getCourierNameListItems('Courier', null);
      this.selectedCourier = null;
    } else {
      this.CourierCIFromList = [{ itemText: 'N/A', masterListItemId: null }];
      this.courierList = [{ itemText: 'Select', masterListItemId: null }];
      this.selectedCourier = null;
    }
  }
  
  getCourierCIFromListItems(listName: string, parentId: number | null): void {
    this.apiService.getListItems(listName, parentId).subscribe({
      next: (data: any) => {
        if (this.selectedDestination?.itemText === 'International') {
          const selectOption = { itemText: 'Select', masterListItemId: null };
          this.CourierCIFromList = [selectOption, ...data];
        } else if (this.selectedDestination?.itemText === 'Domestic') {
          const selectOption = { itemText: 'N/A', masterListItemId: null };
          this.CourierCIFromList = [selectOption, ...data];
        } else if (this.selectedDestination?.itemText === 'Select') {
          this.CourierCIFromList = [{ itemText: 'N/A', masterListItemId: null }];
        }
        else {
          this.CourierCIFromList = [{ itemText: 'N/A', masterListItemId: null }];
        }
      },
      error: (error: any) => {
        this.appService.errorMessage('Failed to fetch CourierCIFrom list items.');
      }
    });
  }
  

  initializeSelectedRows(): void {
    // Loop through grid data and determine which rows to select based on your condition
    this.gridDataResult.data.forEach((dataItem, index) => {

      if (!this.addCustomerMode && Number(dataItem.customerOrderDetailID) > 0) // Positive number
       {
        

        const selectedRecord = {
          CustomerOrderDetailID: dataItem.customerOrderDetailID,
          InventoryID: dataItem.inventoryID,
          ShippedQty: Number(dataItem.shippedQty),
          RecordStatus: 'U' // Assuming existing records are set to 'U'
        };

        // Add the record to the selectedRecords set
        this.selectedRecords.add(selectedRecord);


        this.selectedcheckBoxs.add(dataItem.inventoryID);
        // Ensure `this.grid` is a reference to the Kendo Grid component
       }
    });

    console.log( this.selectedRows);
 

    
  }

  isRowSelected = (rowArgs: RowArgs): boolean => {
    // Return true if the row's unique key is in the selectedRecords Set
    return this.selectedcheckBoxs.has(rowArgs.dataItem.inventoryID);
  };
  // onShippingMethodChange(method: any): void {

  //   alert(JSON.stringify(this.selectedShippingMethod));
  // }
  
  /* onSelectionChange(event: any): void {

  
    (event.selectedRows || []).forEach((row: { dataItem: any }) => this.selectedRecords.add({
      CustomerOrderDetailID: null, // Assuming new records
      InventoryID: row.dataItem.inventoryID,
      ShippedQty: Number(row.dataItem.shippedQty),
      RecordStatus: 'I'
    }));

    (event.deselectedRows || []).forEach((row: { dataItem: any }) => this.selectedRecords.delete({
      CustomerOrderDetailID: null,
      InventoryID: row.dataItem.inventoryID,
      ShippedQty: Number(row.dataItem.shippedQty),
      RecordStatus: 'I'
    }));
  
  
  } */
    onSelectionChange(event: any): void {
      (event.selectedRows || []).forEach((row: { dataItem: any }) => {
        let customerOrderDetailID = row.dataItem.customerOrderDetailID ?? null;
    
        const recordStatus = customerOrderDetailID !== null ? 'U' : 'I';
    
        const selectedRecord = {
          CustomerOrderDetailID: customerOrderDetailID, 
          InventoryID: row.dataItem.inventoryID,
          ShippedQty: Number(row.dataItem.shippedQty),
          RecordStatus: recordStatus
        };
    
        this.selectedRecords.add(selectedRecord); 
        this.selectedcheckBoxs.add(row.dataItem.inventoryID);
      });
    
      (event.deselectedRows || []).forEach((row: { dataItem: any }) => {
        let customerOrderDetailID = row.dataItem.customerOrderDetailID ?? null;
        const uniqueKey = row.dataItem.inventoryID || customerOrderDetailID;


    if (customerOrderDetailID !== null) {
      this.selectedRecords.forEach(record => {
        if (record.CustomerOrderDetailID === customerOrderDetailID && record.InventoryID === row.dataItem.inventoryID) {
          record.RecordStatus = 'D'; 
        }
      });
    } else {
      this.selectedRecords.forEach(record => {
        if (record.InventoryID === row.dataItem.inventoryID) {
          this.selectedRecords.delete(record);
        }
      });
    }

    this.selectedcheckBoxs.delete(row.dataItem.inventoryID);
      });
    
      console.log('Updated Selected Records:', Array.from(this.selectedRecords)); 
    }
    

  initializeColumns(): void {
    this.columns = [
      /*  { field: 'receiptID', title: 'Receipt ID', width: 100 },
       { field: 'inventoryID', title: 'Inventory ID', width: 100 },
       { field: 'hardwareType', title: 'Hardware Type', width: 150, template: (dataItem: any) => dataItem.hardwareType || 'N/A' }, */
      { field: 'iseLotNum', title: 'ISE Lot Number', width: 80 },
      { field: 'inventoryID', title: 'Inventory ID', width: 100 },
      { field: 'customerLotNum', title: 'Customer Lot Number', width: 80 },
      { field: 'expectedQty', title: 'Expected Quantity', width: 60 },
      { field: 'expedite', title: 'Expedite', width: 60, template: (dataItem: any) => dataItem.expedite ? 'Yes' : 'No' },
      { field: 'partNum', title: 'Part Number', width: 80 },
      { field: 'labelCount', title: 'Label Count', width: 60 },
      // { field: 'coo', title: 'Country of Origin (COO)', width: 100 },
      { field: 'dateCode', title: 'Date Code', width: 80 },
      { field: 'shippedQty', title: 'Shipped Quantity', width: 60, editable: true },
      // { field: 'isHold', title: 'Is Hold', width: 80, template: (dataItem: any) => dataItem.isHold ? 'Yes' : 'No' },
      { field: 'holdComments', title: 'Hold Comments', width: 100, template: (dataItem: any) => dataItem.holdComments || 'N/A' },
     
      // { field: 'createdOn', title: 'Created On', width: 150, template: (dataItem: any) => new Date(dataItem.createdOn).toLocaleString() },
      // { field: 'modifiedOn', title: 'Modified On', width: 150, template: (dataItem: any) => new Date(dataItem.modifiedOn).toLocaleString() },
      // { field: 'active', title: 'Active', width: 80, template: (dataItem: any) => dataItem.active ? 'Yes' : 'No' }
    ];
  }

  cancelRequest(): void {
    this.cancel.emit();  // Emit the cancel event when Cancel button is clicked
  }

  // Function to load data from the API based on selected filters
  
  onSearch(): void {
    if (!this.customerSelected) {
      
      this.appService.errorMessage('Please select a customer');
      return;
    } 
    const customerId = this.customerSelected?.CustomerID || null;
    const goodsType = this.deviceTypeSelected || 'All';  // Fallback to 'All' if undefined
    const lotNumber = this.lotNumber || 'null';  // Fallback to 'null' if not set
    const customerordType=this.customerOrderTypeSelected;
    this.gridDataResult.data = [];
    this.customerOrd=[];
    this.apiService.getInventory(customerId, goodsType, lotNumber,customerordType).subscribe({
      next: (res: any) => {
        console.log(res);
        this.gridDataResult.data = res;
      },
      error: (err) => {
        this.gridDataResult.data = []
      }
    });
  }



  editHandler({ sender, rowIndex, columnIndex, dataItem }: CellClickEvent): void {

    if (!this.isEditMode) return; // Disable cell edits in view mode
    // Adjust columnIndex by subtracting 1 to account for the checkbox column
    const adjustedColumnIndex = columnIndex - 1;

    if (adjustedColumnIndex >= 0) {
      const clickedColumn = this.columns[adjustedColumnIndex]?.field;

      // Restrict editing to the 'shippedQty' column only
      if (clickedColumn === 'shippedQty') {
        sender.editCell(rowIndex, sender.columns.toArray()[columnIndex], dataItem);
      

      } else {
        sender.closeCell();  // Close the cell without any arguments
      }
    } else {
      sender.closeCell();  // Close the cell if the checkbox column is clicked
    }

   
  }

  cellCloseHandler({ sender, dataItem, column }: any): void {
    // Check if the column being edited is 'shippedQty'
    if (column.field === 'shippedQty') {

      // The new value is already bound to the dataItem via ngModel
      console.log('Updated shippedQty:', dataItem.shippedQty);  // This should log the new value
    }

    // You can manually update the selected records here if needed
  this.selectedRecords.forEach((selectedRecord) => {
    if (selectedRecord.InventoryID === dataItem.inventoryID) {
      selectedRecord.ShippedQty = Number(dataItem.shippedQty);  // Update the ShippedQty in selectedRecords
    }
  });

    // Close the cell after the edit
    sender.closeCell();
  }


  onFilter(value: string): void {
    // Check if the filter input is empty
    if (value) {
        // Filter the allLotNumbers list based on the input
        this.lotNumbers = this.allLotNumbers.filter(lot =>
            lot.toLowerCase().includes(value.toLowerCase())
        );
    } else {
        // Reset to the full list when the input is cleared
        this.lotNumbers = [...this.allLotNumbers];
    }
}
  getLotNumbers(): void {
    
    this.apiService.getallLotsdata().subscribe({
      next: (v: any) => {
        this.allLotNumbers = v; // Store the full list
        this.lotNumbers = [...this.allLotNumbers]; 
      },
      error: (v: any) => { }
    });
  }

  submitForm(): void {
    if ( this.selectedRecords.size <=0) {
      
      this.appService.errorMessage('Please select atleast one row ');
      return;
    } 
    if (!this.selectedShippingMethod?.masterListItemId) {
      this.appService.errorMessage('Please select ShippingMethod');
      return;
    } 
    if (this.selectedShippingMethod?.masterListItemId === 1448) {
      if (!this.validateShipAlertEmail()) {
        return; 
      }
      if (!this.shippingDetailsData.ContactPerson) {
        this.appService.errorMessage('Please enter contact person');
        return;
      } 
    }
    if (this.selectedShippingMethod?.masterListItemId === 1447) {
      if (!this.validateShipAlertEmail()) {
        return; 
      }
    }
    if (this.selectedShippingMethod?.masterListItemId === 1534) {
      if (!this.validateShipAlertEmail()) {
        return; 
      }
      if (!this.validateTotalValue()) {
        return; 
      }
      if (!this.validateUnitValue()) {
        return; 
      }
      if (!this.selectedCOO?.masterListItemId) {
        this.appService.errorMessage('Please select COO.');
        return;
      }
  
      if (!this.selectedCIFrom?.masterListItemId) {
        this.appService.errorMessage('Please select CI Form.');
        return;
      }
      if (!this.UnitValue) {
        this.appService.errorMessage('Please enter UnitValue.');
        return;
      }
    }
    if (this.selectedShippingMethod?.masterListItemId === 1446) {
      if (!this.selectedDestination?.masterListItemId) {
        this.appService.errorMessage('Please select Destination.');
        return;
      }
      if (!this.selectedCourier?.masterListItemId) {
        this.appService.errorMessage('Please select Courier Name.');
        return;
      }
      if (this.selectedCourier?.masterListItemId == 3) {
        if (!this.validateShipAlertEmail()) {
          return; 
        }
        if (!this.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select Service Type.');
          return;
        }
        if (!this.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill Transportation To.');
          return;
        }
        if (!this.Courier.BillTransportationAcct) {
          this.appService.errorMessage('Please enter Trasportation Acct#.');
          return;
        }
      }
  
      if (this.selectedCourier?.masterListItemId == 4) {
        if (!this.validateEmailOnSubmit()) {
          return; 
        }
        if (!this.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill Transportation To.');
          return;
        }
        if (!this.Courier.UPSAccountNumber) {
          this.appService.errorMessage('Please enter UPS Account Number.');
          return;
        }
        if (!this.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select UPS Service.');
          return;
        }
      }
      if (this.selectedCourier?.masterListItemId == 5) {
        if (!this.validateUnitValue()) {
          return; 
        }
        if (!this.selectedCIFrom?.masterListItemId) {
          this.appService.errorMessage('Please select CI Form.');
          return;
        }
        if (!this.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select Service Type.');
          return;
        }
        if (!this.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill Transportation To.');
          return;
        }
        if (!this.Courier.BillTransportationAcct) {
          this.appService.errorMessage('Please enter Bill Trasportation Acct#.');
          return;
        }
        if (!this.selectedBillDutyTaxFeesTo?.itemText) {
          this.appService.errorMessage('Please select Bill Duties/taxes/fees.');
          return;
        }
        if (!this.Courier.Duties) {
          this.appService.errorMessage('Please enter Duties/taxes/fees Acc#.');
          return;
        }
        if (!this.selectedCOO?.masterListItemId) {
          this.appService.errorMessage('Please select COO.');
          return;
        }
        if (!this.UnitValue) {
          this.appService.errorMessage('Please enter UnitValue.');
          return;
        }
      }
      if (this.selectedCourier?.masterListItemId == 6) {
        if (!this.validateEmailOnSubmit()) {
          return; 
        }
        if (!this.validateTotalValue()) {
          return; 
        }
        if (!this.validateShipAlertEmail()) {
          return; 
        }
        if (!this.selectedCIFrom?.masterListItemId) {
          this.appService.errorMessage('Please select CI Form.');
          return;
        }
        if (!this.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill Transportation To.');
          return;
        }
        if (!this.selectedBillDutyTaxFeesTo?.itemText) {
          this.appService.errorMessage('Please select Bill Duties/taxes/fees.');
          return;
        }
        if (!this.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select UPS Service.');
          return;
        }
        if (!this.Courier.UPSAccountNumber) {
          this.appService.errorMessage('Please enter UPS Account Number.');
          return;
        }
        if (!this.selectedCOO?.masterListItemId) {
          this.appService.errorMessage('Please select Country of Origin.');
          return;
        }
        if (!this.Quantity) {
          this.appService.errorMessage('Please enter Units.');
          return;
        }
        if (!this.UnitValue) {
          this.appService.errorMessage('Please enter UnitValue.');
          return;
        }
        if (!this.Courier.Height) {
          this.appService.errorMessage('Please enter Acct#.');
          return;
        }
      }
      if (this.selectedCourier?.masterListItemId == 7) {
        if (!this.validateUnitValue()) {
          return; 
        }
        if (!this.validateShipAlertEmail()) {
          return; 
        }
        if (!this.selectedCIFrom?.masterListItemId) {
          this.appService.errorMessage('Please select CI Form.');
          return;
        }
        if (!this.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select Product.');
          return;
        }
        if (!this.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill To.');
          return;
        }
        if (!this.Courier.BillTransportationAcct) {
          this.appService.errorMessage('Please enter Bill To Account.');
          return;
        }
        if (!this.selectedBillDutyTaxFeesTo?.itemText) {
          this.appService.errorMessage('Please select Bill Duties/taxes/fees.');
          return;
        }
        if (!this.Courier.Duties) {
          this.appService.errorMessage('Please enter Duties/taxes/fees Acc#.');
          return;
        }
        if (!this.selectedCOO?.masterListItemId) {
          this.appService.errorMessage('Please select Country of Origin.');
          return;
        }
        if (!this.selectedCommodityOrigin?.itemText) {
          this.appService.errorMessage('Please select Commodity Origin.');
          return;
        }
        if (!this.UnitValue) {
          this.appService.errorMessage('Please enter UnitValue.');
          return;
        }
      }
    }
    if (this.selectedShippingMethod?.masterListItemId === 1447 || 
      this.selectedShippingMethod?.masterListItemId === 1446 || 
      this.selectedShippingMethod?.masterListItemId === 1534) {

    
    if (!this.address.Country) {
      this.appService.errorMessage('Please enter Country.');
      return;
    }

    if (!this.shippingDetailsData.ContactPerson) {
      this.appService.errorMessage('Please enter Contact Name.');
      return;
    }

    if (!this.address.CompanyName) {
      this.appService.errorMessage('Please enter Company Name.');
      return;
    }

    if (!this.address.Address1) {
      this.appService.errorMessage('Please enter Address 1.');
      return;
    }
    if (!this.address.Phone) {
      this.appService.errorMessage('Please enter Telephone.');
      return;
    }
    if (!this.address.State) {
      this.appService.errorMessage('Please enter State/Province.');
      return;
    }
    if (!this.address.City) {
      this.appService.errorMessage('Please enter City.');
      return;
    }
    if (!this.address.PostCode) {
      this.appService.errorMessage('Please enter PostCode.');
      return;
    }
  }
  debugger;
  const formattedPickUpDate = this.ExpectedPickUpDate ? this.ExpectedPickUpDate.toISOString().split('T')[0] : null;
  const PickUptime = this.shippingDetailsData.ExpectedTime;
  const formattedshipDate = this.ShipDate ? this.ShipDate.toISOString().split('T')[0] : null;
  const Shiptime = this.shippingDetailsData.ShippingTime; 
   
     
    const customerAddress: CustomerAddress = {
      ShippingMethodId:this.selectedShippingMethod.masterListItemId,
      IsForwarder: this.shippingDetailsData.Forwarder,  
      ContactPerson: this.shippingDetailsData.ContactPerson,
      Phone: this.address.Phone, 
      ShipAlertEmail: this.shippingDetailsData.ShipAlertEmail,
      ExpectedTime: (formattedPickUpDate && PickUptime) ? `${formattedPickUpDate} ${PickUptime}` : null,  
      Comments: this.address.Comments,  
      SpecialInstructionforShipping: this.address.SpecialInstructions,  
      PackingSlipComments: this.address.PackingComments,  
      CIComments: this.address.InvoiceComments,
      AddressId:this.address.addressId,  
      Email:this.shippingDetailsData.Email,
      Country:this.address.Country,
      CompanyName:this.address.CompanyName,
      Address1:this.address.Address1,
      Address2:this.address.Address2,
      Address3:this.address.Address3,
      Zip:this.address.PostCode,
      StateProvince:this.address.State,
      City:this.address.City,
      Extension:this.address.Ext,
      ShipDate:(formattedshipDate && Shiptime) ? `${formattedshipDate} ${Shiptime}` : null,
      CountryOfOrigin:this.selectedCOO?.itemText,
      CIFromId:this.selectedCIFrom?.masterListItemId,
      UnitValue:this.UnitValue,
      TotalValue:this.TotalValue,
      Units:this.Quantity,
      ECCN:this.shippingDetailsData.ECCN,
      ScheduleBNumber:this.ScheduleB,
      LicenseType:this.selectedLicense?.itemText,
      CommidityDescription:this.shippingDetailsData.CommodityDescription,
      UltimateConsignee:this.shippingDetailsData.UltimateConsignee,
      DestinationId:this.selectedDestination?.masterListItemId,
      CourierId:this.selectedCourier?.masterListItemId,
      ServiceType:this.selectedServiceType?.itemText,
      PackageType:this.Courier.PackageType,
      BillTransportationTo:this.selectedBillTransport?.itemText,
      BillTransportationAcct:this.Courier.BillTransportationAcct,
      CustomerReference:this.Courier.CustomerReference,
      NoOfPackages:this.Courier.NumberOfPackages,
      Weight:this.Courier.Weight,
      PackageDimentions:this.Courier.PackageDimension,
      IsResidential:this.Courier.Residential,
      AccountNumber:this.Courier.UPSAccountNumber,
      ReferenceNumber1:this.Courier.Length,
      ReferenceNumber2:this.Courier.Width,
      OtherAccountNumber:this.Courier.Height,
      TaxId:this.Courier.Taxid,
      Attention:this.Courier.Attention,
      InvoiceNumber:this.Courier.InvoiceNumber,
      BillDutyTaxFeesTo:this.selectedBillDutyTaxFeesTo?.itemText,
      BillDutyTaxFeesAcct:this.Courier.Duties,
      CommodityDescription:this.shippingDetailsData.CommodityDescription,
      ScheduleBUnits1:this.Courier.ScheduleBUnits1,
      PurchaseNumber:this.Courier.PurchaseNumber,
      ShipmentReference:this.shippingDetailsData.Height,
      CustomsTermsOfTradeId:this.selectedCustomeTT?.masterListItemId, 
      Qty:this.Courier.Qty,
      CommodityOrigin:this.selectedCommodityOrigin?.itemText
    };
    const customerOrderID = (this.customerOrd && this.customerOrd.length > 0) 
    ? (this.customerOrd.find((order: any) => order.customerOrderID !== null && order.customerOrderID !== undefined)?.customerOrderID ?? null)
    : null;
    const customerOrder: CustomerOrder = {
      CustomerOrderID: customerOrderID,
      CustomerId: this.formData.CustomerId ?? this.customerSelected?.CustomerID,
      CustomerOrderType: this.formData.customerOrderTypeSelected ?? this.customerOrderTypeSelected,
      //CustomerId: 1,
      OQA: this.formData.OQA,
      Bake: this.formData.Bake,
      PandL: this.formData.PandL,
      CompanyName: this.formData.CompanyName,
      ContactPerson: this.formData.ContactPerson,
      ContactPhone: this.formData.ContactPhone,
      Address1: this.formData.Address1,
      Address2: this.formData.Address2 || null,
      City: this.formData.City,
      State: this.formData.State,
      Zip: this.formData.Zip,
      Country: this.formData.Country,
      OrderStatus: null,
      RecordStatus: customerOrderID != null ? 'U' : 'I',
      Active: true,
      CustomerOrderDetails: Array.from(this.selectedRecords),
     CustomerAddress:[customerAddress]
    };
 
    const payload: OrderRequest = {
      CustomerOrder: [customerOrder]
    };


    this.apiService.processCustomerOrder(payload).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.customerAdded.emit();
        this.cancel.emit();
        
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });


    
  

  }

}


