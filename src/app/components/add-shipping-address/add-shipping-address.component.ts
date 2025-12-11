import { Component, OnInit, EventEmitter, Output, Input, ViewChild,SimpleChanges } from '@angular/core';
import { CustomerService } from '../../services/customer.service';  // Adjust the path as necessary
import { CellClickEvent, GridComponent, GridDataResult,RowArgs  } from '@progress/kendo-angular-grid';
import { CustomerOrder, OrderRequest,CustomerAddress } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ICON, MESSAGES, Customer } from 'src/app/services/app.interface';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-add-shipping-address',
  templateUrl: './add-shipping-address.component.html',
  styleUrls: ['./add-shipping-address.component.scss'],
  standalone: false
})
export class AddShippingAddressComponent implements OnInit{
  readonly ICON = ICON
  @Input() customerSelected:any | null;
  @Input() isEditMode: boolean = true;  // Use this flag to control view/edit mode
  @Input() addCustomerMode: boolean = false;
  @Input() deliveryInfo:any | null;
  @Output() shippingAddress = new EventEmitter<any>();
  customer: Customer[] = []
  addressDataResult: GridDataResult = { data: [], total: 0 };
  selectedShippingMethod: any = null;
  selectedRejectLocation: any = null;
  selectedContactPerson: any = null;
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
  ContactPersonList: any[] = [];
  RejectLocationlist: any[] = [];
  MasterContactPersonList: any[] = [];
  SelectedContactPersonDetails: any;
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
  AwbOrTracking: string = '';
  MasterCourierList:any[] = []; 
  selectedRows: any[] = []; 
  selectedcheckBoxs: Set<number> = new Set<number>();
  public columns: any[] = [];
  public addressDataResultcolumns: any[] = []; 
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
    HoldShip:false,
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
  billToAddress = {
    billtoaddressId:0,
    Country: '',
    ContactPerson: '',
    CompanyName: '',
    Address1: '',
    Address2: '',
    Address3: '',
    TelePhone: '',
    State: '',
    City: '',
    PostCode: '',
    Ext: ''
  }; 
  ngOnChanges(changes: SimpleChanges) {
    if (changes['customerSelected'] && this.customerSelected?.CustomerID) {
      this.getContactPersonDetails(this.customerSelected.CustomerID, null);
    }
  }
 
  async ngOnInit(): Promise<void> {
    await this.getMasterListItems('ShippingMethod', null);
    await this.getCOOListItems('CountryOfOrigin',null);
    await this.getCIFromListItems('CIFrom',null);
    await this.getLicensListItems('LicenseType',null);
    await this.getbillTransportListItems('BillTransportationTo',null);
    await this.getCustomeTTListItems('CustomsTermsofTrade',null);
    await this.getserviceTypeListItems('ServiceType',null);
    await this.getRejectLocationlistItems('RejectLocation',null);
    if (!this.addCustomerMode) {
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
        this.sameAsShipTo=this.deliveryInfo[0]?.billCheck || false,
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
        this.billToAddress = {
          billtoaddressId: this.deliveryInfo[0]?.customerBillTOAddressId || 0,
          Country: this.deliveryInfo[0]?.billToCountry || '',
          CompanyName: this.deliveryInfo[0]?.billToCompanyName || '',
          Address1: this.deliveryInfo[0]?.billToAddress1 || '',
          Address2: this.deliveryInfo[0]?.billToAddress2 || '',
          Address3: this.deliveryInfo[0]?.billToAddress3 || '',
          TelePhone: this.deliveryInfo[0]?.billToPhone || '',
          State: this.deliveryInfo[0]?.billToStateProvince || '',
          City: this.deliveryInfo[0]?.billToCity || '',
          PostCode: this.deliveryInfo[0]?.billToPostCode || '',
          Ext: this.deliveryInfo[0]?.billToExt || '',
          ContactPerson: this.deliveryInfo[0]?.billToContactPerson || ''
        };
            
      }
      
    }
    this.getDestinationListItems('Destination',null);
    this.getCourierNameListItems('Courier',null);
    this.getCourierCIFromListItems('CIFrom',null);
    //  this.getContactPersonDetails(this.customerSelected?.CustomerID ?? 0, null);

  }

  async getContactPersonDetails(customerId: number, shippingContactId: number | null) {
    try {
      const response: any = await this.apiService.getContactPersonDetails(customerId, shippingContactId).toPromise();
      if (Array.isArray(response)) {
        this.MasterContactPersonList = response
        this.ContactPersonList = response
          .filter(item => 
            item.shippingContactName) 
          .map(item => ({
            masterListItemId: item.shippingContactId,
            itemText: item.shippingContactName
          }));
      } else {
        console.error("Unexpected response format:", response);
        this.ContactPersonList = [];
      }
    } catch (error) {
      console.error("API Error:", error);
      this.ContactPersonList = [];
    }
  }
   onContactPersonChange(selectedContactperson: any) {
    if (selectedContactperson&&selectedContactperson.masterListItemId) {
      this.SelectedContactPersonDetails = this.MasterContactPersonList.find(item => item.shippingContactId == selectedContactperson.masterListItemId)
      if (this.SelectedContactPersonDetails) {
        this.selectedCourier = null;
        this.selectedDestination = null;
          this.address.Address1= this.SelectedContactPersonDetails.address1 || '',
          this.address.Address2= this.SelectedContactPersonDetails.address2 || '',
          this.address.Address3= this.SelectedContactPersonDetails.address3 || '',
          this.address.addressId=this.SelectedContactPersonDetails.addressId || 0,
          this.AwbOrTracking= this.SelectedContactPersonDetails.awbOrTracking || '',
          this.Courier.Duties= this.SelectedContactPersonDetails.billDutyTaxFeesAcct|| ''
          if (this.SelectedContactPersonDetails.billDutyTaxFeesTo) {
            this.selectedBillDutyTaxFeesTo = this.billTransportList.find(
              a => a.itemText === this.SelectedContactPersonDetails.billDutyTaxFeesTo
            );
          }          
          this.Courier.BillTransportationAcct= this.SelectedContactPersonDetails.billTransportationAcct || ''
          if (this.SelectedContactPersonDetails.billTransportationTo) {
            this.selectedBillTransport = this.billTransportList.find(
              a => a.itemText === this.SelectedContactPersonDetails.billTransportationTo
            );
          }
          this.address.City= this.SelectedContactPersonDetails.city || '',
          this.address.Comments= this.SelectedContactPersonDetails.comments || '',
          this.shippingDetailsData.CommodityDescription= this.SelectedContactPersonDetails.commodityDescription || '',
          this.address.CompanyName= this.SelectedContactPersonDetails.companyName || '',
          this.shippingDetailsData.ContactPerson= this.SelectedContactPersonDetails.contactPerson || '',
          this.address.Country= this.SelectedContactPersonDetails.country || ''
          if ( this.SelectedContactPersonDetails.destinationId>0) {
            this.selectedDestination= this.destinationList.find(a=> a.masterListItemId==this.SelectedContactPersonDetails.destinationId)
          }
          this.getCourierCIFromListItems('CIFrom',null);
          if ( this.SelectedContactPersonDetails.courierId>0) {
            if (this.selectedDestination?.itemText === 'International') {
              const courierListt = this.MasterCourierList.filter((item: { parent: number; }) => item.parent === 2);
              const selectOption = { itemText: 'Select', masterListItemId: null };
              this.courierList = [selectOption, ...courierListt];
            } else if (this.selectedDestination?.itemText === 'Domestic') {
              const courierListt = this.MasterCourierList.filter((item: { parent: number; }) => item.parent === 1);
              const selectOption = { itemText: 'Select', masterListItemId: null };
              this.courierList = [selectOption, ...courierListt];
            }
            this.selectedCourier= this.MasterCourierList.find(a=> a.masterListItemId==this.SelectedContactPersonDetails.courierId)
          }
          if ( this.SelectedContactPersonDetails.customerId>0) {
            this.customerSelected= this.customer.find(a=> a.CustomerID==this.SelectedContactPersonDetails.customerId)
          }
          if ( this.SelectedContactPersonDetails.customsTermsOfTradeId>0) {
            this.selectedCustomeTT= this.CustomeTTList.find(a=> a.masterListItemId==this.SelectedContactPersonDetails.customsTermsOfTradeId)
          }
         
          // email: this.SelectedContactPersonDetails.dropOffCity || ''
          this.shippingDetailsData.Email= this.SelectedContactPersonDetails.email || ''
          // email: this.SelectedContactPersonDetails.expectedTime || ''
          this.address.Ext= this.SelectedContactPersonDetails.extension || ''
          this.shippingDetailsData.Forwarder= this.SelectedContactPersonDetails.isForwarder || ''
          if (this.SelectedContactPersonDetails.licenseType) {
            this.selectedLicense = this.LicenseList.find(
              a => a.itemText === this.SelectedContactPersonDetails.licenseType
            );
          }
          this.address.Phone= this.SelectedContactPersonDetails.phone || ''
          // email: this.SelectedContactPersonDetails.sendToCountry || ''
          if (this.SelectedContactPersonDetails.serviceType) {
            this.selectedServiceType = this.serviceTypeList.find(
              a => a.itemText === this.SelectedContactPersonDetails.serviceType
            );
          }
          
          this.shippingDetailsData.ShipAlertEmail= this.SelectedContactPersonDetails.shipAlertEmail || ''
          // email: this.SelectedContactPersonDetails.shipDate || ''
          // email: this.SelectedContactPersonDetails.shippingContactId || ''
          // email: this.SelectedContactPersonDetails.shippingContactName || ''
          if ( this.SelectedContactPersonDetails.shippingMethodId>0) {
            this.selectedShippingMethod= this.shippingMethods.find(a=> a.masterListItemId==this.SelectedContactPersonDetails.shippingMethodId)
          }
          this.address.State= this.SelectedContactPersonDetails.stateProvince || ''
          this.UnitValue= this.SelectedContactPersonDetails.unitValue || ''
          this.address.PostCode= this.SelectedContactPersonDetails.zip|| ''
      }
    }
    else{
      this.SelectedContactPersonDetails = null;
      return;
    }
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

onShippingMethodChange(): void {
  this.selectedCourier = null;
  this.selectedDestination = null;
  this.selectedContactPerson=null;
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
  sameAsShipTo: boolean = false;
  isBillTo: boolean = false;
 toggleBillTo(): void {
   this.isBillTo = true;
 }
 toggleShipTo(): void {//need this falg to load address table
  this.isBillTo = false;
 }

 copyShipTo(): void {
  if (this.sameAsShipTo) {
    this.billToAddress = {
      ...this.billToAddress,
      billtoaddressId: this.address.addressId,
      Country: this.address.Country,
      ContactPerson: this.shippingDetailsData.ContactPerson,
      CompanyName: this.address.CompanyName,
      Address1: this.address.Address1,
      Address2: this.address.Address2,
      Address3: this.address.Address3,
      TelePhone: this.address.Phone,
      State: this.address.State,
      City: this.address.City,
      PostCode: this.address.PostCode,
      Ext: this.address.Ext,
    };
  } else {
    this.billToAddress = {
      billtoaddressId:0,
      Country: '',
      ContactPerson: '',
      CompanyName: '',
      Address1: '',
      Address2: '',
      Address3: '',
      TelePhone: '',
      State: '',
      City: '',
      PostCode: '',
      Ext: ''
    }; 
  }
}

  openDialog() {
    var a = this.customerSelected?.CustomerID || null;
    if (a === null) {
      this.appService.errorMessage('Please select a customer.');
      this.dialogVisible = false;
      return;
    } 
    var isDomestic = false;
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
    this.loadShippingAddresses(a, this.isBillTo, null, courierId, isDomestic);
        this.dialogVisible = true;
  }
  
  
  loadShippingAddresses(customerId: number| null, isBilling: boolean, vendorId: number | null, courierId: number | null, isDomestic: boolean) {
    this.addressDataResult.data = [];
    this.addressDataResult.total = 0;
    this.apiService.getShippingAddressData(customerId, isBilling, vendorId, courierId, isDomestic).subscribe({
      next: (data: any[]) => {
        this.addressDataResult.data = data;
        let selectedAddressId = isBilling ? this.billToAddress?.billtoaddressId : this.address?.addressId;

        if (selectedAddressId) {
          const selectedAddress = this.addressDataResult.data.find((address: any) => address.addressId === selectedAddressId);
          if (selectedAddress) {
            // Store selection separately for Ship To & Bill To
            if (isBilling) {
              this.tempBillToSelectedAddress = selectedAddress;
            } else {
              this.tempShipToSelectedAddress = selectedAddress;
            }
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
  
  tempShipToSelectedAddress: any = null;
  tempBillToSelectedAddress: any = null;  
  onRadioChange(dataItem: any) {
    if (this.isBillTo) {
      this.tempBillToSelectedAddress = dataItem;
    } else {
      this.tempShipToSelectedAddress = dataItem;
    }
  }
  

 closeDialog() {
  this.dialogVisible = false;
 }
 onOk() {
  if (this.isBillTo) {
    // Check if a Bill To address has been selected
    if (this.tempBillToSelectedAddress) {
      this.billToAddress = {
        billtoaddressId: this.tempBillToSelectedAddress.addressId,
        Country: this.tempBillToSelectedAddress.country,
        ContactPerson: this.tempBillToSelectedAddress.contactPerson,
        CompanyName: this.tempBillToSelectedAddress.companyName,
        Address1: this.tempBillToSelectedAddress.address1,
        Address2: this.tempBillToSelectedAddress.address2,
        Address3: this.tempBillToSelectedAddress.address3,
        TelePhone: this.tempBillToSelectedAddress.phone,
        State: this.tempBillToSelectedAddress.state,
        City: this.tempBillToSelectedAddress.city,
        PostCode: this.tempBillToSelectedAddress.zip,
        Ext: this.tempBillToSelectedAddress.extension
      };
    } else {
      this.appService.errorMessage('Please select at least one Bill To address');
      return;
    }
  } else {
    // Check if a Ship To address has been selected
    if (this.tempShipToSelectedAddress) {
      this.address = {
        addressId: this.tempShipToSelectedAddress.addressId,
        ReceiversName: '',
        Country: this.tempShipToSelectedAddress.country,
        contactPerson: this.tempShipToSelectedAddress.contactPerson,
        CompanyName: this.tempShipToSelectedAddress.companyName,
        Address1: this.tempShipToSelectedAddress.address1,
        Address2: this.tempShipToSelectedAddress.address2,
        Address3: this.tempShipToSelectedAddress.address3,
        Phone: this.tempShipToSelectedAddress.phone,
        State: this.tempShipToSelectedAddress.state,
        City: this.tempShipToSelectedAddress.city,
        PostCode: this.tempShipToSelectedAddress.zip,
        Ext: this.tempShipToSelectedAddress.extension,
        Comments: '',   
        SpecialInstructions: '',   
        PackingComments: '',   
        InvoiceComments: ''
      };

      // Update shipping details contact person
      this.shippingDetailsData.ContactPerson = this.tempShipToSelectedAddress.contactPerson;
    } else {
      this.appService.errorMessage('Please select at least one Ship To address');
      return;
    }
  }

  // Close the dialog after successful selection
  this.closeDialog();
}

  onCancel() {
    this.closeDialog();
  }
  async getRejectLocationlistItems(listName: string, parentId: number | null){
    this.RejectLocationlist = await new Promise<any>((resolve, reject) => { 
      this.apiService.getListItems(listName, parentId).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
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
            this.MasterCourierList=data;
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
  

}
