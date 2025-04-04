import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { PDFExportComponent } from '@progress/kendo-angular-pdf-export';
import { FileRestrictions, FileSelectComponent } from '@progress/kendo-angular-upload';
import { map, Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { RadioButtonModule } from '@progress/kendo-angular-inputs';
import {
  Address, AppFeatureField, Country, CourierDetails, Customer, CustomerType, DeliveryMode, DeviceItem, DeviceType, Employee,
  EntityType, GoodsType, HardwareItem, ICON, INIT_DEVICE_ITEM, INIT_HARDWARE_ITEM, INIT_MISCELLANEOUS_GOODS, INIT_POST_DEVICE,
  INIT_POST_RECEIPT, InterimLot, InterimItem, JSON_Object, LotCategory, MESSAGES, MiscellaneousGoods, PostDevice, PostHardware, PostMiscGoods, PostReceipt,
  ReceiptAttachment, ReceiptLocation, SignatureTypes, Vendor,InterimDevice,PackageCategory,Others,MailInfoRequest,MailRoomDetails} from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { GridDataResult } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-add-mail-info',
  templateUrl: './add-mail-info.component.html',
  styleUrls: ['./add-mail-info.component.scss']
})

export class AddMailInfoComponent implements OnInit, OnDestroy {
  readonly ICON = ICON;
  @Output() onClose = new EventEmitter<void>();
  @Output() onRestart = new EventEmitter<void>();

  readonly customerTypes: CustomerType[] = this.appService.masterData.customerType;
  customerTypeSelected: CustomerType | undefined;
  readonly packageCategoryList: PackageCategory[]= this.appService.masterData.PackageCategory;
  gridData: GridDataResult = { 
    data: [
      { type: null, details: '', qty: '' }  // `type` will hold the selected dropdown value
    ], 
    total: 1 
  };
  awbMailCode='';
  scanLocation='';
  typeList: Others[] = this.appService.masterData?.Others ?? [];  
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  readonly goodsType: GoodsType[] = this.appService.masterData.goodsType;
  goodsTypeSelected: GoodsType | undefined;
  isDisabledGoodsType = false;
  readonly deliveryMode: DeliveryMode[] = this.appService.masterData.deliveryMode;
  deliveryModeSelected: DeliveryMode | undefined;
  isePOList:any[] = [];
  isePOListSelected:any;
  public selectedQty: number | null = null;
  text1:string | undefined;
  isPartialDelivery: boolean | undefined;
  isDamaged: boolean | undefined;
  placeLotOnHold: boolean = false;
  selectedCategory: { id: number; name: string } | undefined;
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
  readonly vendors: Vendor[] = this.appService.masterData.entityMap.Vendor;
  vendorSelected: Vendor | undefined;
  behalfOfCusotmerSelected: Customer | undefined;
  behalfOfVendorSelected: Vendor | undefined;
  contactPhone = '';

  signatureName = ''
  Signaturebase64Data = ''
  readonly signatureTypes: SignatureTypes[] = [
    { customerTypeID: 1, customerTypeName: 'Customer' }, { customerTypeID: 3, customerTypeName: 'Employee' },
  ]
  signatureEmployeeSelected: Employee | undefined;
  signatureTypeSelected: SignatureTypes | undefined;
  signatureDate: Date = new Date();
  expectedDateTime: Date = new Date();
  format = "MM/dd/yyyy HH:mm";

  name: string = '';
  email ='';
  comments: string = '';
  deliveryComments: string = '';
  address: any;
  readonly addresses: Address[] = this.appService.masterData.addresses;
  addressSelected: Address | undefined;
  readonly countries = this.appService.masterData.country
  countrySelected: Country | undefined;
  readonly couriers = this.appService.masterData.courierDetails
  courierSelected: CourierDetails | undefined
  readonly lotCategories = this.appService.masterData.lotCategory;
  lotCategorySelected: LotCategory | undefined;
  // readonly deviceTypes = this.appService.masterData.deviceType;
  readonly deviceTypes: DeviceType[] = [];
  deviceTypeSelected: DeviceType | undefined;
  isHoldCheckboxEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == 'HoldCheckbox')?.active ?? true;
  isHoldCommentEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == "HoldComments")?.active ?? true;
  @ViewChild('noOfCartons', { static: false, }) noOfCartons: ElementRef | undefined;
  isExpected = false;
  isFTZ: boolean = false;
  isInterim: boolean = false;
  isDisabled: any = {
    clearReceipt: false,
    addReceipt: false,
    addDevice: false,
    addHardware: false,
    addMisc: false,
    cancelBtn: false
  }
  hardware = {
    isItemsRemoved: false
  }
  tracking = ''
  customVendorName: string | undefined;
  readonly hardwareTypes = this.appService.hardwareTypes;
  readonly subscription = new Subscription()
  readonly filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  PMReceivers:any[] = [];
  PMReceiverSelected:any;
  readonly employees: Employee[] = this.appService.masterData.entityMap.Employee
  requestorSelected: Employee | undefined;
  recipientSelected: Employee | undefined;
  contactPerson =''


  constructor(public appService: AppService, private apiService: ApiService) { 
    // this.getInvUserByRole();
  }

  ngOnInit(): void {
    // this.init();
    const user = this.employees.find(emp => emp.EmployeeID === this.appService.loginId);
    if (user) {
      this.requestorSelected = user;
      this.recipientSelected = user;
      this.contactPerson= this.requestorSelected?.EmployeeName;
    }
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
   
    if(this.appService.sharedData.receiving.isEditMode){
      this.isDisableInterim = true;
    }
  }
  addOthersRow() {
    this.gridData.data.unshift({
      type: null,  // Dropdown default value
      details: '',
      qty: ''
    });
  
    // Update total count
    this.gridData.total = this.gridData.data.length;
  
    // Trigger UI update
    this.gridData = { ...this.gridData };
  }
  
  onDamageChange(): void {
    if (!this.isDamaged) {
      this.placeLotOnHold = false; 
    }
  }
  ngOnDestroy(): void {
    this.appService.sharedData.receiving.isEditMode = false
    this.appService.sharedData.receiving.isViewMode = false;
    this.subscription.unsubscribe();
  }
  isVisibleHoldComments = true;
  isDisableHoldComments = false;
  isVisibleFTZ = true;
  isDisableFTZ = false;
  isVisibleInterim = true;
  isDisableInterim = false;
 
  onChangeAddress() {
    if (this.addressSelected) {
      this.contactPhone = this.addressSelected.phone + ''
    }
  }
  
  getISEPOList(customerId: number|undefined, divisionId: number|null, isFreezed: boolean|null) {
    debugger;
    this.apiService.getISEPOList(customerId,divisionId,isFreezed).subscribe({
      next: (data: any[]) => { 
        this.isePOList = Array.isArray(data) ? data : []; 
      },
      error: (err) => {
        console.error('Error fetching isePOList:', err);
        this.isePOList = [];
      }
    });
  }
  
  isDisabledBehalfOfCusotmer = false
  onChangeCustomerType() {
    if (this.customerTypeSelected?.customerTypeName == 'Customer') {
      this.isDisabledBehalfOfCusotmer = true
    } else {
      this.isDisabledBehalfOfCusotmer = false
    }
  }
  onChangeCustomerName() {
    debugger;
    if (this.customerTypeSelected?.customerTypeName == 'Customer') {
      this.isDisabledBehalfOfCusotmer = true
      this.behalfOfCusotmerSelected = this.customerSelected;
      this.getISEPOList(this.customerSelected?.CustomerID,null,null);
    }
    this.onChangeBehalfOfCusotmer();
  }
  onChangeBehalfOfCusotmer() {
    if (this.appService.sharedData.receiving.dataItem) {
      this.appService.sharedData.receiving.dataItem.behalfID = this.behalfOfCusotmerSelected?.CustomerID;
      this.getISEPOList(this.behalfOfCusotmerSelected?.CustomerID,null,null);
      // this.fetchDevicesByCustomer();
    }
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

        

        this.signatureTypeSelected,
        this.signatureEmployeeSelected,
        this.signatureName,

        this.address,
        this.email,
        this.contactPhone,
        this.contactPerson
      ]
      const hasTruthyValue = valuesToCheck.some(v => v);
      return hasTruthyValue
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
  submitForm(): void {
    const otherDetailsArray = this.gridData.data
  .filter(item => item && item.type && item.details?.trim() && item.qty != null && item.qty !== '')
  .map(item => ({
    OtherId: null,
    TypeId: item.type.id,  
    Details: item.details.trim(),
    Qty: item.qty
  }))|| [];
    const MailRoomDetails: MailRoomDetails = {
      CustomerTypeId: this.customerTypeSelected?.customerTypeID,
      CustomerVendorId: this.customerSelected?.CustomerID || this.vendorSelected?.VendorID,
      BehalfId: this.behalfOfCusotmerSelected?.CustomerID,
      AWBMailCode: this.awbMailCode,
      ScanLocation: this.scanLocation,
      LocationId: this.receiptLocationSelected?.receivingFacilityID,
      RecipientId: this.recipientSelected?.EmployeeID,
      SendorId: this.requestorSelected?.EmployeeID,
      PartialDelivery: this.isPartialDelivery,
      IsDamage: this.isDamaged,
      IsHold: this.placeLotOnHold,
      DeliveryMethodId: this.deliveryModeSelected?.deliveryModeID,
      ContactPerson: this.contactPerson,
      Email: this.email,
      CourierId: this.courierSelected?.courierDetailID,
      SendFromCountryId: this.countrySelected?.countryID,
      TrackingNumber: this.tracking,
      ExpectedDateTime: this.expectedDateTime,
      AddressId: this.addressSelected?.addressId,
      MailComments: this.deliveryComments,
      NoofPackages: this.selectedQty,
      PackageCategory: this.selectedCategory?.id.toString(),
      POId: this.isePOListSelected?.purchaseOrderId,
      OtherDetails: otherDetailsArray
    };    
  
    const payload: MailInfoRequest = {
      MailDetails: [MailRoomDetails]
    };
    const loginId = this.appService.loginId;
    this.apiService.saveMailRoomInfo(payload,loginId).subscribe({
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
}
