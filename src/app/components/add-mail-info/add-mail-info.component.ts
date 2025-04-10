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
  selectedCategory: PackageCategory[] = [];
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
  vendors: Vendor[] = this.appService.masterData.entityMap.Vendor;
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
  isCategorySelected(id: number): boolean {
    return this.selectedCategory?.some((item: PackageCategory) => item.id === id);
  }
  
  toggleCategorySelection(item: PackageCategory): void {
    const index = this.selectedCategory?.findIndex((cat: PackageCategory) => cat.id === item.id);
    if (index >= 0) {
      this.selectedCategory.splice(index, 1); 
    } else {
      this.selectedCategory.push(item); 
    }
    this.selectedCategory = [...this.selectedCategory]; 
  }

  tagDisplayLimit(tags: PackageCategory[]): PackageCategory[] {
    const maxVisibleTags = 2;
    return tags.length > maxVisibleTags
      ? [...tags.slice(0, maxVisibleTags), { id: 0, categoryName: `+${tags.length - maxVisibleTags}` }]
      : tags;
  }
  isOtherCategorySelected(): boolean {
    return this.selectedCategory?.some(cat => cat.id === 38);
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
      this.isePOListSelected = null;
      this.getISEPOList(this.customerSelected?.CustomerID,null,null);
    }
    this.onChangeBehalfOfCusotmer();
  }
  onChangeBehalfOfCusotmer() {
    if (this.appService.sharedData.receiving.dataItem) {
      this.appService.sharedData.receiving.dataItem.behalfID = this.behalfOfCusotmerSelected?.CustomerID;
      this.isePOListSelected = null;
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
    if (!this.awbMailCode?.trim()) {
      this.appService.errorMessage('Please enter AWB / ISE Mailroom Barcode');
      return;
    }
  
    if (!this.scanLocation?.trim()) {
      this.appService.errorMessage('Please enter Scan Staging Location');
      return;
    }
    if (!this.customerTypeSelected) {
      this.appService.errorMessage('Please select customer/vendor');
      return;
    }
    if (this.customerTypeSelected?.customerTypeName === 'Customer' && !this.customerSelected?.CustomerID) {
      this.appService.errorMessage('Please select Customer');
      return;
    }
  
    if (this.customerTypeSelected?.customerTypeName === 'Vendor' && !this.vendorSelected?.VendorID) {
      this.appService.errorMessage('Please select Vendor');
      return;
    }
    if (!this.behalfOfCusotmerSelected?.CustomerID) {
      this.appService.errorMessage('Please select Behalf of Customer');
      return;
    }
  
    if (!this.receiptLocationSelected?.receivingFacilityID) {
      this.appService.errorMessage('Please select ISE Destination Location')
      return;
    }
    if (!this.recipientSelected?.EmployeeID) {
      this.appService.errorMessage('Please select Recipient / Attention To')
      return;
    }
    if (!this.requestorSelected?.EmployeeID) {
      this.appService.errorMessage('Please select Requestor/Sender Name')
      return;
    }
    if (!this.deliveryModeSelected) {
      this.appService.errorMessage('Please select delivery mode');
      return;
    }
    if(this.deliveryModeSelected && this.deliveryModeSelected?.deliveryModeName=='Pickup'){
      if(!this.contactPhone){
        this.appService.errorMessage('Please enter contact phone');
        return;
      }
      if(!this.contactPerson){
        this.appService.errorMessage('Please enter contact person');
        return;
      }
      if (!this.addressSelected) {
        this.appService.errorMessage('Please select address');
        return;
      }
    }
    if(this.deliveryModeSelected && this.deliveryModeSelected?.deliveryModeName=='Courier'){
      if (!this.tracking) {
        this.appService.errorMessage('Please enter tracking ID');
        return;
      }
      if (!this.courierSelected) {
        this.appService.errorMessage('Please select courier name')
        return;
      }
      if (!this.countrySelected) {
        this.appService.errorMessage('Please select country')
        return;
      }
    }
    if(this.deliveryModeSelected && this.deliveryModeSelected?.deliveryModeName=='Customer Drop-Off'){
      if(!this.contactPerson){
        this.appService.errorMessage('Please enter contact person');
        return;
      }
    }
    if(this.deliveryModeSelected?.deliveryModeName=='Customer Drop-Off'||this.deliveryModeSelected?.deliveryModeName=='Pickup'){
      this.email = this.email?.trim() || "";
      if (this.email) {
        // email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(this.email)) {
          this.appService.errorMessage('Invalid email address');
          return;
        }
      }
    }
    if (this.contactPhone) {
      const phoneRegex = /^[0-9]{0,20}$/; // adjust min/max length as needed
      if (!phoneRegex.test(this.contactPhone)) {
        this.appService.errorMessage('Phone number must contain only digits');
        return;
      }
    }
    if (!this.selectedQty || this.selectedQty <= 0) {
      this.appService.errorMessage('Number of Packages is required and must be greater than 0');
      return;
    }
    if (!this.selectedCategory || this.selectedCategory.length === 0) {
      this.appService.errorMessage('At least one Package Category must be selected');
      return;
    }
    if (this.isOtherCategorySelected()) {
      for (let i = 0; i < this.gridData.data.length; i++) {
        const row = this.gridData.data[i];
  
        if (!row.type) {
          this.appService.errorMessage(`Row ${i + 1}: Please select a type.`);
          return;
        }
  
        if (!row.details || row.details.trim() === '') {
          this.appService.errorMessage(`Row ${i + 1}: Please enter details`);
          return;
        }
  
        if (row.qty == null || row.qty <= 0) {
          this.appService.errorMessage(`Row ${i + 1}: Please enter quantity `);
          return;
        }
      }
    }
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
      CustomerVendorName: this.customerSelected?.CustomerName || this.vendorSelected?.VendorName,
      BehalfId: this.behalfOfCusotmerSelected?.CustomerID,
      AWBMailCode: this.awbMailCode.trim(),
      ScanLocation: this.scanLocation.trim(),
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
      PackageCategory: this.selectedCategory.map(cat => cat.id).join(','),
      POId: this.isePOListSelected?.purchaseOrderId,
      Signaturebase64Data: this.Signaturebase64Data,
      OtherDetails: otherDetailsArray
    };    
  
    const payload: MailInfoRequest = {
      MailDetails: [MailRoomDetails]
    };
    const loginId = this.appService.loginId;
    this.apiService.saveMailRoomInfo(payload,loginId).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        if (this.customerTypeSelected?.customerTypeName === 'Vendor' && this.vendorSelected?.VendorName) {
          this.apiService.getEntitiesName('Vendor').subscribe({
            next: (value: any) => {
              const vendors = value as Vendor[];
              this.appService.masterData.entityMap.Vendor = vendors;
              this.vendors = vendors;
            },
            error: (err) => console.error('Error refreshing vendor list', err)
          });          
        }
        this.onClose.emit();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }  
}
