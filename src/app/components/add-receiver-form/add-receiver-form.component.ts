import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { PDFExportComponent } from '@progress/kendo-angular-pdf-export';
import { map, Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Address, AppFeatureField, Country, CourierDetails, Customer, CustomerType, DeliveryMode, Employee, HardwareItem, ICON, INIT_DEVICE_ITEM, InterimLot, InterimItem,
   MESSAGES, PostHardware, ReceiptLocation, Vendor,DeviceFamily,Coo,LotOwners,TrayPart,TrayVendor, Others,Hardware, Quotes, PurchaseOrder, Category,ReceiptDetails,
   PackageCategory,LotDetails,TrayDetails,HardwareDetails,OtherDetails,
   ReceiptJson,
   INIT_RECEIPT} from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment'

enum TableType {
  Device = 'Device',
  Hardware = 'Hardware',
  Misc = 'Misc'
}
enum ActionType {
  Remove = 'Remove'
}
const CUSTOMER_DROP_OFF = 'Customer Drop-Off'
const PICKUP = 'Pickup'
const COURIER = 'Courier'

@Component({
  selector: 'add-receiver-form',
  templateUrl: './add-receiver-form.component.html',
  styleUrls: ['./add-receiver-form.component.scss']
})
export class AddReceiverFormInternalComponent implements OnInit, OnDestroy {
  readonly ICON = ICON;
  readonly TableType = TableType;
  @Output() onClose = new EventEmitter<void>();
  @Output() onRestart = new EventEmitter<void>();
  isInterim: boolean = false;
  readonly customerTypes: CustomerType[] = this.appService.masterData.customerType;
  customerTypeSelected: CustomerType | undefined;
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
  readonly vendors: Vendor[] = this.appService.masterData.entityMap.Vendor;
  vendorSelected: Vendor | undefined;
  behalfOfCusotmerSelected: Customer | undefined;
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  readonly employee: Employee[] = this.appService.masterData.entityMap.Employee
  recipientSelected: Employee | undefined;
  requestorSelected: Employee | undefined;
  notesInformation: string = '';
  readonly deliveryMode: DeliveryMode[] = this.appService.masterData.deliveryMode;
  deliveryModeSelected: DeliveryMode | undefined;
  contactPhone = '';
  tracking = ''
  readonly couriers = this.appService.masterData.courierDetails
  courierSelected: CourierDetails | undefined
  readonly countries = this.appService.masterData.country
  countrySelected: Country | undefined;
  expectedDateTime: Date = new Date();
  contactPerson = this.appService.userName;
  email: string | null = '';
  readonly addresses: Address[] = this.appService.masterData.addresses;
  addressSelected: Address | undefined;
  PickupDropoffComments: string = '';
  public selectedQty: number | null = null;
  public expectedQty: number | null = null;
  public trayQty: number | null = null;
  public hardwareQty: number | null = null;
  public otherQty: number | null = null;
  readonly category : PackageCategory[] = this.appService.masterData.PackageCategory;
  quotesList:Quotes[] = this.appService.masterData?.Quotes ?? [];
  selectedQuotesList : Quotes | undefined;
  custometPurchase:PurchaseOrder[] = this.appService.masterData?.PurchaseOrder ?? [];
  selectedCustometPurchase : PurchaseOrder | undefined;
  lotCategory:Category[] = this.appService.masterData?.Category ?? [];
  selectedLotCategory : Category | undefined;
  iseLot: string = '';
  customerLot: string = '';
  deviceFamily: DeviceFamily[] = this.appService.masterData.deviceFamily;
  selectedDeviceFamily : DeviceFamily | undefined;
  dateCode: string = '';
  coo: Coo[] = this.appService.masterData.coo;
  selectedCoo : Coo | undefined;
  lotOwner: LotOwners[] = this.appService.masterData.lotOwners;
  selectedLotOwner : LotOwners | undefined;
  trayVendor: TrayVendor[] = this.appService.masterData.trayVendor;
  selectedTrayVendor : TrayVendor | undefined;
  trayPart: TrayPart[] = this.appService.masterData.trayPart;
  selectedTrayPart : TrayPart | undefined;
  hardwareList:Hardware[] = this.appService.masterData?.hardware;
  selectedHardwareList : Hardware | undefined;
  projectDevice: string='';
  hardwareId: string='';
  otherList:Others[] = this.appService.masterData?.Others;
  selectedOtherList : Others | undefined;
  otherDetails: string='';
  requestID : number = 0;
  format = "MM/dd/yyyy HH:mm";
  
  readonly lotIdentifiers = [
    { name: 'Test', id: 'Test' },
    { name: 'Test&Rel', id: 'Test&Rel' },
    { name: 'Rel', id: 'Rel' },
    { name: 'Customer Lot', id: 'Customer Lot' },
    { name: 'TBD', id: 'TBD' },
  ]
   
  isHoldCheckboxEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == 'HoldCheckbox')?.active ?? true;
  isHoldCommentEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == "HoldComments")?.active ?? true;
  @ViewChild('noOfCartons', { static: false, }) noOfCartons: ElementRef | undefined;
  gridData = [
    {
      holdComments: "",//option for feilds after getting orginal will take out
      customerLot: "",
      expectedQty: "",
      deviceFamily: '',
      dateCode:"",
      coo:'',
      expedite: false,
      iqaOptional: false,
      lotOwner:'',
      noOfCartons: undefined,//no
      isHold: false,
      trayVendor:"",
      trayQty:"",
      hardwareQty:"",
      projectDevice:"",
      otherDetails:"",
      otherQty:"",
      isHoldCheckboxEnabled: !this.isHoldCheckboxEnabled,
      isHoldCommentEnabled: !this.isHoldCommentEnabled
    }
  ];
  isExpected = false;
  isFTZ: boolean = false;
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
  customVendorName: string | undefined;
  readonly hardwareTypes = this.appService.hardwareTypes;
  readonly subscription = new Subscription()
  readonly filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  PMReceivers:any[] = [];
  PMReceiverSelected:any;
  SelectedPMReceiver:any;
  hardwareData = [{   
    selectedHardwareList: null,
    projectDevice: '',
    hardwareId: '',
    hardwareQty: null}];
  trayData = [{ 
    selectedTrayVendor: null,
    selectedTrayPart: '',
    trayQty: null  }];
  otherData = [{ 
    selectedOtherList: null,
    otherDetails: null,
    otherQty: null}];
    selectedCategories: { id: number; categoryName: string }[] = [];
  expedite: boolean = true;
  isHold : boolean = true;
  iqaOptional : boolean = true;
    isCategorySelected(categories: string): boolean {
    return this.selectedCategories.some(category => category.categoryName === categories);
  }
  selectedReceiverFiles:any[] = [];
  receiverFormDetails : any;
  receiverAttachements:any[] = [];
  filteredReceiverAttachements:any[] = [];
  readonly downloadFileApi = environment.apiUrl + 'v1/ise/inventory/download/'
  
  constructor(public appService: AppService, private apiService: ApiService) { 
    this.getInvUserByRole();
  }
  ngOnInit(): void {
    this.init();
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
    if(this.appService.sharedData.receiving.isEditMode){
      this.isDisableInterim = true;
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
  getISEPOList(selectedId: number , isCustomer: boolean) {
    this.apiService.getISEPOList(selectedId, null, isCustomer).subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.PurchaseOrder = value.map((a: PurchaseOrder) => {
            let props = [a.purchaseOrderId, a.customerPoNumber];
            props = props.filter(a => a);
            return a;
          });
        }
      }
    });
  }  

  private getDeviceFamilies(customerId: number) {
    this.apiService.DeviceFamily(customerId).subscribe({
      next: (value: any) => {
        this.appService.masterData.deviceFamily = value;
      }
    })
  }
  
  onTrayPartChange(value: any): void {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      const exists = this.trayVendor.some(
        v => v.vendorName.toLowerCase() === trimmedValue.toLowerCase()
      );
  
      if (!exists && trimmedValue) {
        const newVendor: TrayVendor = {
          trayVendorId: 1,
          vendorName: trimmedValue
        };
        this.trayVendor.push(newVendor);
        this.selectedTrayVendor = newVendor;
      }
    } else {
      this.selectedTrayVendor = value;
    }
  }
  
  onVendorValueChange(value: any): void {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      const exists = this.vendors.some(
        v => v.VendorName.toLowerCase() === trimmedValue.toLowerCase()
      );
  
      if (!exists && trimmedValue) {
        const newVendor: Vendor = {
          VendorID: 1,
          VendorName: trimmedValue
        };
        this.vendors.push(newVendor);
        this.vendorSelected = newVendor;
      }
    } else {
      this.vendorSelected = value;
    }
  }

  onCustomerPOValueChange(value: any): void {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      const exists = this.custometPurchase.some(
        v => v.customerPoNumber.toLowerCase() === trimmedValue.toLowerCase()
      );
  
      if (!exists && trimmedValue) {
        const newVendor: PurchaseOrder = {
          purchaseOrderId: 1,
          customerPoNumber: trimmedValue
        };
        this.custometPurchase.push(newVendor);
        this.selectedCustometPurchase = newVendor;
      }
    } else {
      this.selectedCustometPurchase = value;
    }
  }
  onQtyChange(value: number): void {
    // If the value is not a whole number, clear the field
    if (value != null && !Number.isInteger(value)) {
      this.selectedQty = null;
    }
  }
  
  validatePhone(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.contactPhone = input.value;
  }
  lotDetails: LotDetails[] = [];
  trayDetails: TrayDetails[] = [];
  hardwareDetails: HardwareDetails[] = [];
  otherListDetails: OtherDetails[] = [];
  onSubmit() {
    const receiptDetails : ReceiptDetails = {
      IsInterim: this.isInterim,
        CustomerTypeID: this.customerTypeSelected?.customerTypeID ?? null,
        CustomerVendorName: this.customerSelected?.CustomerName ?? null,
        BehalfID: this.behalfOfCusotmerSelected?.CustomerID ?? null,
        RecipientId: this.recipientSelected?.EmployeeID ?? null,
        SendorId: this.requestorSelected?.EmployeeID ?? null,
        ReceivingFacilityID: this.receiptLocationSelected?.receivingFacilityID ?? null,
        DeliveryMethodID: this.deliveryModeSelected?.deliveryModeID ?? null,
        ContactPerson: this.contactPerson ?? null,
        Email: this.email ?? null,
        CourierID: this.courierSelected?.courierDetailID ?? null,
        CountryFromID: this.countrySelected?.countryID ?? null,
        TrackingNumber: this.tracking ?? null,
        ExpectedDateTime: this.expectedDateTime?.toISOString() ?? null,
        AddressID: this.addressSelected?.addressId ?? null,
        ContactPhone: this.contactPhone ?? null,
        ReceivingInstructions: this.PickupDropoffComments ?? null,
        Notes: this.notesInformation ?? null,
        NoofPackages: this.selectedQty ?? 0,
        PackageCategory: this.selectedCategories?.map(c => c.categoryName).join(',') ?? null,
        Quotes: this.selectedQuotesList?.quote ?? null,
        PONumber: this.selectedCustometPurchase?.customerPoNumber ?? null,
        LotCategoryId: this.selectedLotCategory?.serviceCategoryId ?? null,
    } as ReceiptDetails;
    const lotDetailss = this.lotDetails;
    const hardwareDetailss = this.hardwareDetails;
    const trayDetailss = this.trayDetails;
    const otherDetailss = this.otherListDetails;
    const ticket : ReceiptJson = {
      ReceiptDetails:receiptDetails,
      LotDetails:lotDetailss[0],
      HardwareDetails:hardwareDetailss[0],
      TrayDetails: trayDetailss[0],
      OtherDetails: otherDetailss[0]
    }
    console.log(this.otherData);
    if (!this.customerTypeSelected) {
      this.appService.errorMessage('Please select customer/vendor');
      return;
    }
    if (this.customerTypeSelected?.customerTypeName == 'Customer') {
      ticket.ReceiptDetails.BehalfID = this.behalfOfCusotmerSelected?.CustomerID || null;
      if (this.customerSelected) {
        // custom value by user
        ticket.ReceiptDetails.CustomerVendorName = this.customerSelected?.CustomerName
        this.receipt.isValid.customer = true;
      } else {
        this.receipt.isValid.customer = false;
        this.appService.errorMessage('Please select customer');
        return;
      }
    } else {
      if (this.vendorSelected) {
        if (this.vendorSelected?.VendorID == 9999) {
          // due to new entry refresh masterdata
          this.appService.refreshVendors = true;
          ticket.ReceiptDetails.CustomerVendorName = this.vendorSelected.VendorName;
        } else {
          ticket.ReceiptDetails.CustomerVendorName = this.vendorSelected?.VendorName || null;
        }
        ticket.ReceiptDetails.BehalfID = this.behalfOfCusotmerSelected?.CustomerID || null;
      } else {
        this.appService.errorMessage('Please select vendor');
        return;
      }
    }
    if (!this.behalfOfCusotmerSelected) {
      this.appService.errorMessage('Please select Behalf of Customer');
      return;
    }
    
    if (!this.receiptLocationSelected) {
      this.appService.errorMessage('Please select ISE destination location');
      return;
    }
    if (!this.recipientSelected) {
      this.appService.errorMessage('Please select Recipient / Attention To');
      return;
    }
    if (!this.requestorSelected) {
      this.appService.errorMessage('Please select Requestor / Sender Name');
      return;
    }
    if (!this.deliveryModeSelected) {
      this.receipt.isValid.deliveryMode = false;
      this.appService.errorMessage('Please select delivery mode');
      return;
    } else {
      this.receipt.isValid.contactPhone = true;
    }
    if ([CUSTOMER_DROP_OFF, PICKUP,COURIER].includes(this.deliveryModeSelected?.deliveryModeName)) {
      if (!this.contactPhone) {
        if(this.deliveryModeSelected?.deliveryModeName=='Pickup'){
          this.receipt.isValid.contactPhone = false;
          this.appService.errorMessage('Please enter contact phone');
          return;
        }
        else {
          this.receipt.isValid.contactPhone = true;
        }
      } else {
        this.receipt.isValid.contactPhone = true;
      }
      if (!this.contactPerson) {
        this.receipt.isValid.contactPerson = false;
        this.appService.errorMessage('Please enter contact person');
        return;
      } else {
        this.receipt.isValid.contactPerson = true;
      }
      this.email = this.email?.trim() || "";
      if (this.email) {
        // email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(this.email)) {
          this.appService.errorMessage('Invalid email address');
          return;
        }
      }
      if (this.deliveryModeSelected?.deliveryModeName == PICKUP) {

        if (!this.addressSelected) {
          this.receipt.isValid.address = false;
          this.appService.errorMessage('Please select address');
          return;
        } else {
          this.receipt.isValid.address = true;
        }
      }
      if (ticket.ReceiptDetails.NoofPackages < 0) {
        this.appService.errorMessage('No. of cartons cannot be less than zero');
        return;
      }
    }
   
    if (this.deliveryModeSelected?.deliveryModeName == COURIER) {
      if (this.tracking) {
        this.receipt.isValid.tracking = true
      } else {
        this.receipt.isValid.tracking = false
        this.appService.errorMessage('Please enter Tracking/AWB#');
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
      if(!this.expectedDateTime){
        this.appService.errorMessage('Please select Expected Date & Time')
        return;
      }
    }
    if(!this.selectedQty)
    {
      this.appService.errorMessage('Please select Number of Packages')
      return;
    }
    if (!this.selectedCategories || this.selectedCategories.length === 0) {
      this.appService.errorMessage('Please select Package Category');
      return;
    }
    if (!this.selectedLotCategory) {
      this.appService.errorMessage('Please select Lot Category');
      return;
    }
    if (this.isCategorySelected("Lot")) {
    for (let i = 0; i < this.lotDetails.length; i++) {
      const lot = this.lotDetails[i];

      if (!lot.customerLotNumber) {
        this.appService.errorMessage("Please enter Customer LOT#");
        return;
      }
      if (!lot.lotOwnerID) {
        this.appService.errorMessage("Please select Lot Owner");
        return;
      }
      if (!lot.expectedQty) {
        this.appService.errorMessage("Please enter Expected Qty");
        return;
      }
    }
  }
  if (this.isCategorySelected("Hardware")) {
    for (let i = 0; i < this.hardwareDetails.length; i++) {
      const hw = this.hardwareDetails[i];

      if (!hw.hardwareTypeId) {
        this.appService.errorMessage("Please select Hardware Type");
        return;
      }
      if (!hw.projectDevice) {
        this.appService.errorMessage("Please select Project/Device Name");
        return;
      }
      if(!hw.hardwareId){
        this.appService.errorMessage("Please select Hardware Id")
      }
    }
  }
    if (this.isCategorySelected("Tray")) {
    
    for (let i = 0; i < this.trayDetails.length; i++) {
      const tray = this.trayDetails[i];

      if (!tray.trayVendorName) {
        this.appService.errorMessage("Please select Tray Vendor");
        return;
      }
      if (!tray.trayPartId) {
        this.appService.errorMessage("Please select Tray Part");
        return;
      }
      if (!tray.qty) {
        this.appService.errorMessage("Please enter Tray Qty");
        return;
      }
    }
  }

  var receiverFiles:any[] = [];
  if (this.selectedReceiverFiles && this.selectedReceiverFiles.length) {
    if (this.selectedReceiverFiles.length < 1) {
      this.appService.errorMessage('Error while selecting package label file(s)');
      return;
    }

    this.selectedReceiverFiles.forEach((file:any) => {
      receiverFiles.push(file.rawFile);
    })
  }

    var deletedAttachmentsJson = ''
    var deletedAttachments:any[] = []
    
    this.receiverAttachements.filter(a => a.active == false).forEach((attach:any) => {
      var attachment: any = {
        attachmentId: attach.attachmentId,
        section: attach.Section,
        path: attach.path,
        active: attach.active
      }
      deletedAttachments.push(attachment);
    })

    if(deletedAttachments.length > 0)
      deletedAttachmentsJson = JSON.stringify(deletedAttachments)

    const payload: ReceiptJson= ticket;
    
    const receiverJson = JSON.stringify(payload)

    this.apiService.saveReceiverFormInternal(receiverFiles, receiverJson, this.requestID, this.appService.loginId, deletedAttachmentsJson).subscribe({
    //this.apiService.saveReceiverFormInternal(this.requestID, this.appService.loginId, ticket).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.onClose.emit();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
    });
  }
  
  
  private initInputFields(appFeatureFields: AppFeatureField[]) {
    appFeatureFields.forEach(aff => {
      switch (aff.featureFieldName) {
        case "ISFTZ":
          this.isVisibleFTZ = aff.active;
          this.isDisableFTZ = !aff.isWriteOnly;
          break;
        case "ISInterim":
          this.isVisibleInterim = aff.active
          debugger;
          this.isDisableInterim = !aff.isWriteOnly;
          break;
        case "ReceiptHold":
          this.isDisableHoldComments = !aff.isWriteOnly
          break;
        default:
          break;
      }
    });
  }

  private init() {
    
    if (this.appService.sharedData.receiving.isViewMode || this.appService.sharedData.receiving.isEditMode) {
      const dataItem = this.appService.sharedData.receiving.dataItem;

      this.isFTZ = dataItem.isFTZ;
      this.isInterim = dataItem.isInterim;
      this.isExpected = dataItem.isExpected;

      this.customerTypeSelected = this.customerTypes.find(c => c.customerTypeID == dataItem.customerTypeID);
      this.onChangeCustomerType();
      if (this.customerTypeSelected) {
        if (this.customerTypeSelected.customerTypeName == 'Customer') {
          this.customerSelected = this.customers.find((c) => c.CustomerID == dataItem.customerVendorID);
        } else {
          this.vendorSelected = this.vendors.find((v) => v.VendorID == dataItem.customerVendorID);
          // this.behalfOfVendorSelected = this.vendors.find(v => v.VendorID == dataItem.behalfID);
        }
        this.behalfOfCusotmerSelected = this.customers.find(c => c.CustomerID == dataItem.behalfID);
      }
      this.receiptLocationSelected = this.receiptLocation.find(c => c.receivingFacilityID == dataItem.receivingFacilityID);

     
      this.deliveryModeSelected = this.deliveryMode.find(c => c.deliveryModeID == dataItem.deliveryModeID);
      this.tracking = dataItem.trackingNumber || ''
      if (dataItem.courierDetailID) {
        this.courierSelected = this.couriers.find(c => c.courierDetailID == dataItem.courierDetailID)
      }
      if (dataItem.countryFromID) {
        this.countrySelected = this.countries.find(c => c.countryID == dataItem.countryFromID)
      }
      this.expectedDateTime = new Date(dataItem.expectedDateTime);
      this.PickupDropoffComments = dataItem.mailComments;

      this.addressSelected = this.addresses.find(a => a.addressId == dataItem.addressID)

      this.gridData[0].noOfCartons = dataItem.noOfCartons
      this.gridData[0].isHold = dataItem.isHold
      this.gridData[0].holdComments = dataItem.holdComments

      
      this.email = dataItem.email || '';
      this.contactPhone = dataItem.contactPhone
      this.contactPerson = dataItem.contactPerson
      this.fetchReceiptEmployees()
      this.fetchData();
      if (dataItem.isInterim) {
        this.listInterimLots();
        this.fetchDataInterim();
      }
    } else {
    }
    if (this.appService.sharedData.receiving.isViewMode) {
      this.disabledAllBtns()
    }
  }
  onChangeAddress() {
    if (this.addressSelected) {
      this.contactPhone = this.addressSelected.phone + ''
    }
  }
  private fetchData() {
    this.fetchDevicesByCustomer();
    this.fetchDataHardware();
  }

  currentBehalfID: any;
  private fetchDevicesByCustomer() {
    debugger;
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
        
      },
      error: (e: any) => { }
    })
  }
  private fetchDataInterim() {
    debugger;
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      return;
    }
    this.apiService.listInterimDevices(dataItem.receiptID).subscribe({
      next: (v: any) => {
        debugger;
        this.gridDataInterim = v;
        this.gridDataInterim.forEach((d, index) => {
          d.rowActionMenu = this.RowActionMenuDevice.map(o => ({ ...o }));
          d.interimLotSelected = this.interimLotsList.find(o => o.iseLotNumber == d.iseLotNumber);
        })
      }
    });
  }
 
  private fetchDataHardware() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      return;
    }
    this.apiService.getHardwaredata(dataItem.receiptID).subscribe({
      next: (v: any) => {
        if (v) {
          v.forEach((h: any) => {
            h.hardwareTypeSelected = this.hardwareTypes.find(c => c.hardwareTypeID == h.hardwareTypeID)
            h.customerSelected = this.customers.find(c => c.CustomerID == h.customerID)
          })
        }
        this.gridDataHardware = v;
        // this.goodsTypeSelected = this.goodsType.find(v => v.goodsTypeName == 'Hardware')        
      }
    });
  }
 
  private fetchReceiptEmployees() {
    const dateItem = this.appService.sharedData.receiving.dataItem;
    this.apiService.getReceiptEmployees(dateItem.receiptID).subscribe({
      next: (value: any) => {
        const ids = value.map((v: any) => v.employeeID)
        if (ids) {
          this.employeesSelected = this.employees.filter(e => ids.includes(e.EmployeeID))
        }
      }
    })
  }
  receipt = {
    isValid: {
      customer: true,
      deliveryMode: true,
      contactPhone: true,
      contactPerson: true,
      address: true,
      tracking: true,
      expectedDateTime: true
    }
  }

  // Interim
  public gridDataInterim: InterimItem[] = [];
  addRowInterim() {
    debugger;
    const dataItem = this.appService.sharedData.receiving.dataItem;
    this.gridDataInterim.splice(0, 0, {
      ...INIT_DEVICE_ITEM, receiptID: dataItem.receiptID, recordStatus: "I",
      lotIdentifierSelected: this.lotIdentifiers[0],
      lotIdentifier: this.lotIdentifiers[0].id,
      rowActionMenu: this.RowActionMenuDeviceAdd.map(o => ({ ...o })),

      interimLotSelected: undefined,
      // @ts-ignore
      goodQty: null,
      // @ts-ignore
      receivedQTY: null,
      // @ts-ignore
      rejectQty: null,
    });
  }
  
  onChangeInterim() {
    if (this.isInterim) {
      this.listInterimLots();
      this.fetchDataInterim();
    }
  }
  interimLotsList: InterimLot[] = [];
  private listInterimLots() {
    if (this.interimLotsList.length) {
      return;
    }
    this.apiService.listInterimLots().subscribe({
      next: (v: any) => {
        this.interimLotsList = v;
        this.gridDataInterim.forEach((d, index) => {
          d.interimLotSelected = this.interimLotsList.find(o => o.iseLotNumber == d.iseLotNumber);
        })
      },
      error: (err) => {
      }
    })
  }

  // addHardware
  gridDataHardware: HardwareItem[] = [];
  private doPostProcessHardware(HardwareDetails: PostHardware[]) {
    this.apiService.postProcessHardware({ HardwareDetails }).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.fetchDataHardware();
      },
      error: (e) => {
        let m = MESSAGES.DataSaveError;
        if (e && e.error) {
          const err = e.error;
          if (err instanceof String) {
            m = err.split('\n')[0]
          } else if (err.errors) {
            let v: any = Object.values(err.errors)
            m = v.map((i: string[]) => i[0]).join('\n')
          }
        }
        this.appService.errorMessage(m);
      }
    });
  }
  public selectedValues: string = "";
  readonly employees: Employee[] = this.appService.masterData.entityMap.Employee
  employeesSelected: Employee[] = [];
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
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Remove', svgIcon: ICON.trashIcon },
  ]
  private readonly RowActionMenuDeviceAdd: MenuItem[] = [
    { text: 'Receive', svgIcon: ICON.cartIcon },
    { text: 'Undo Receive', svgIcon: ICON.cartIcon, disabled: true },
    { text: 'Remove', svgIcon: ICON.trashIcon },
  ]

  doTestEditMode() {
    // this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.gridDataHardware[3], 'Device');
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent, dataItem: any, rowIndex: number, tableName: 'Device' | 'Hardware' | 'Misc') {
    switch (e.item.text) {
      case 'Edit Data':
        dataItem.recordStatus = 'U'
        dataItem.dateCode = parseInt(dataItem.dateCode);
        break;
      case 'Receive':
        const noOfCartons = this.gridData[0].noOfCartons;
        if (!noOfCartons) {
          this.appService.errorMessage("Please set No. of Cartons to receive");
          this.noOfCartons?.nativeElement.scrollIntoView({ behavior: 'smooth' })
          return;
        }

        if (dataItem.recordStatus != 'I') {
          dataItem.recordStatus = 'U';
        }
        dataItem.isReceived = true;
        dataItem.dateCode = parseInt(dataItem.dateCode) || '';
        if (dataItem.rowActionMenu) {
          dataItem.rowActionMenu[0].disabled = true;
          dataItem.rowActionMenu[1].disabled = false;
        }
        break;
      case 'Undo Receive':
        dataItem.isReceived = false;
        if (dataItem.rowActionMenu) {
          dataItem.rowActionMenu[0].disabled = false;
          dataItem.rowActionMenu[1].disabled = true;
        }
        break;
      case 'Hold':
        dataItem.isHold = !dataItem.isHold
        break;
      case 'Print':
        this.doPrint(dataItem, tableName)
        break;
      case 'Void Data':
        this.doVoidData(dataItem, rowIndex, tableName)
        break;
      case 'Remove':
        this.doRemoveRow(rowIndex, tableName);
        break;

      default:
        break;
    }
  }
  onOpenRowActionMenu(dataItem: any, tableType: TableType) {
    const a = this.rowActionMenu.find(a => a.text == ActionType.Remove);
    if (a) a.disabled = false;
    switch (tableType) {
      case TableType.Device:
        const ac = dataItem.rowActionMenu.find((a: any) => a.text == ActionType.Remove);
        if (ac) ac.disabled = false;
        if (dataItem.deviceID) {
          if (ac) ac.disabled = true;
        }
        break;
      case TableType.Hardware:
        if (dataItem.hardwareID) {
          if (a) a.disabled = true;
        }
        break;
      case TableType.Misc:
        if (dataItem.miscellaneousGoodsID) {
          if (a) a.disabled = true;
        }
        break;
    }
  }
  private doRemoveRow(rowIndex: number, tableName: 'Device' | 'Hardware' | 'Misc') {
    switch (tableName) {
      
      case 'Hardware':
        this.gridDataHardware.splice(rowIndex, 1);
        this.hardware.isItemsRemoved = true
        break;
        
    }
  }
  private doPrint(r: any, tableName: 'Device' | 'Hardware' | 'Misc') {
    switch (tableName) {
      case 'Device':
        const text = this.appService.formatJson(r);
        this.printPreview(text);
        break;
    }
  }
  private printPreview(textToPrint: string) {
    const printWindow: any = window.open('', '_blank');
    printWindow.document.write(textToPrint);
    printWindow.print();
    // printWindow.close();
  }
  private doVoidData(r: any, rowIndex: number, tableName: 'Device' | 'Hardware' | 'Misc') {
    switch (tableName) {
      case 'Hardware':
        this.gridDataHardware[rowIndex].active = false;
        this.gridDataHardware[rowIndex].recordStatus = "U";
        break;

      default:
        break;
    }
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
  isDisabledBehalfOfCusotmer = false
  onChangeCustomerType() {
    this.customerSelected = undefined;
  this.vendorSelected = undefined;
  this.behalfOfCusotmerSelected = undefined;
    if (this.customerTypeSelected?.customerTypeName == 'Customer') {
      this.isDisabledBehalfOfCusotmer = true
    } else {
      this.isDisabledBehalfOfCusotmer = false
    }
    
  }
  onChangeCustomerName() {
    this.behalfOfCusotmerSelected = undefined;
    this.isDisabledBehalfOfCusotmer = false;
    if (this.customerTypeSelected?.customerTypeName === 'Customer') {
      this.isDisabledBehalfOfCusotmer = true;
      this.behalfOfCusotmerSelected = this.customerSelected;
  
      const customerId = this.customerSelected?.CustomerID;
      if (customerId) {
        this.getISEPOList(customerId, true);  // true indicates Customer
        this.getDeviceFamilies(customerId)
      }
    }
  
    this.onChangeBehalfOfCusotmer();
  }

  onChangeVendorName() {
    if (this.customerTypeSelected?.customerTypeName === 'Vendor') {  
      const vendorId = this.vendorSelected?.VendorID;
      if (vendorId) {
        this.getISEPOList(vendorId, true);  
        this.getDeviceFamilies(vendorId)
      }
    }  
  }
  
  onChangeBehalfOfCusotmer() {
    if (this.appService.sharedData.receiving.dataItem) {
      this.appService.sharedData.receiving.dataItem.behalfID = this.behalfOfCusotmerSelected?.CustomerID;
      this.fetchDevicesByCustomer();
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
  onChangeIsHold() {
    const index = 0;
    if (this.gridData[index].isHold) {
      // do nothing
    } else {
      this.gridData[index].holdComments = '';
    }
  }
  onChangeCustomer() {
    this.gridData[0].customerLot = this.gridData[0].customerLot?.trim()
  }
  onClearForm() {
    this.isFTZ = false;
    this.isInterim = false;
    this.isExpected = false;

    this.customerTypeSelected = undefined
    this.customerSelected = undefined
    this.receiptLocationSelected = undefined
    this.behalfOfCusotmerSelected = undefined

    this.deliveryModeSelected = undefined
    this.tracking = ''
    this.courierSelected = undefined
    this.countrySelected = undefined
    this.expectedDateTime = new Date();
    this.PickupDropoffComments = ''

    this.addressSelected = undefined

    this.gridData[0].noOfCartons = undefined
    this.gridData[0].isHold = false
    this.gridData[0].holdComments = ''

    this.email = ''
    this.contactPhone = ''
    this.contactPerson = ''
    this.employeesSelected = [];
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
 
  getInvUserByRole(){
    const dataItem = this.appService.sharedData.receiving.dataItem;
    const filterKey = 'PMReceiver'
    const isActive = 1
    const condition = null;
    this.apiService.getInvUserByRole(filterKey, isActive, condition).subscribe({
      next: (v:any) => {
        this.PMReceivers = v;
        if(this.appService.sharedData.receiving.isEditMode || this.appService.sharedData.receiving.isViewMode)
          this.PMReceiverSelected = this.PMReceivers.find(e => e.employeeID == dataItem.pmReceiverID)
      }
    });
  }
  getGeneratedLotNumber(): void {
    this.apiService.generateLineItem().subscribe({
      next: (res) => {
        // handle the response
        this.addLotRow(res.data); // pass the lot number to the add method
      },
      error: (err) => {
        console.error('Error generating lot number', err);
      }
    });
  }
  previousCategoryIds: number[] = [];

  onPackageCategoryChange(selectedCategories: { id: number; categoryName: string }[]): void {
  const selectedNames = selectedCategories.map(c => c.categoryName);
  const previousNames = this.previousCategoryIds.map(id => {
    const previousCategory = this.category.find(c => c.id === id); // you need this array
    return previousCategory?.categoryName;
  }).filter(name => !!name); // remove undefined

  // Check for newly added categories
  const newlyAddedCategories = selectedNames.filter(name => !previousNames.includes(name));

  for (const category of newlyAddedCategories) {
    switch (category) {
      case 'Lot':
        this.getGeneratedLotNumber();
        break;
      case 'Hardware':
        this.addHardwareRow();
        break;
      case 'Tray':
        this.addTrayRow();
        break;
      case 'Others':
        this.addOtherRow();
        break;
    }
  }

  // Update previous selection (keep using IDs for simplicity)
  this.previousCategoryIds = selectedCategories.map(c => c.id);
}

  addLotRow(generatedLotNumber?: string) {
    
    const newLotRow =
      {
        ISELotNumber: generatedLotNumber || '',
        customerLotNumber: '',
        expectedQty: null,
        deviceTypeID: null,
        dateCode: '',
        cooId: null,
        expedite: false,
        iqaOptional: false,
        lotOwnerID: null,
        isHold: false
      }
    this.lotDetails = [...this.lotDetails,newLotRow]
  }
  
  addHardwareRow() {
    const newHardwareRow =
      {
        hardwareTypeId: null,
        projectDevice: '',
        hardwareId: null,
        qty: null
      }
      this.hardwareDetails = [...this.hardwareDetails,newHardwareRow]
  }
  
  addTrayRow() {
    const newTrayRow =
    {
      trayVendorName: null,
      trayPartId: null,
      qty: null
    }
    this.trayDetails = [...this.trayDetails,newTrayRow]
  }
  
  addOtherRow() {
    const newOtherListDetails =
      {
        type: null,
        details: '',
        qty: null
      }
    this.otherListDetails = [...this.otherListDetails,newOtherListDetails]
  }
  
  onSelectReceiverAttachment(event: any): void {

    event.files.forEach((f:any) => {
      this.selectedReceiverFiles.push(f);
    })
  }
 
  onReceiverFileRemove(event: any): void {
    const fileToRemove = event.files[0]; 
    this.selectedReceiverFiles = this.selectedReceiverFiles.filter((f:any ) => f.name !== fileToRemove.name);
  }

  onUpload(event: any): void {
    debugger;
    // Send selected files to API
    const formData = new FormData();
    event.files.forEach((file: any) => {
      formData.append('files', file.rawFile);
    });
    // Call API
  }

  deleteReceiverAttachment(dataItem: any) {
    debugger;
    dataItem.active = false;
    var attachment =  this.receiverAttachements.find(a => a.path === dataItem.path);
    if(attachment != undefined)
      attachment.active = false;

    this.filteredReceiverAttachements = this.receiverAttachements.filter(a => a.active == true)
  }
  
}
