import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ActiveColorClickEvent } from '@progress/kendo-angular-inputs';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { PDFExportComponent } from '@progress/kendo-angular-pdf-export';
import { FileRestrictions, FileSelectComponent } from '@progress/kendo-angular-upload';
import { map, Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import {
  Address, AppFeatureField, Country, CourierDetails, Customer, CustomerType, DeliveryMode, DeviceItem, DeviceType, Employee,
  EntityType, GoodsType, HardwareItem, ICON, INIT_DEVICE_ITEM, INIT_HARDWARE_ITEM, INIT_MISCELLANEOUS_GOODS, INIT_POST_DEVICE,
  INIT_POST_RECEIPT, InterimLot, InterimItem, JSON_Object, LotCategory, MESSAGES, MiscellaneousGoods, PostDevice, PostHardware, PostMiscGoods, PostReceipt,
  ReceiptAttachment, ReceiptLocation, SignatureTypes, Vendor,InterimDevice
} from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';

enum TableType {
  Device = 'Device',
  Hardware = 'Hardware',
  Misc = 'Misc',
  Interim = 'Interim'
}
enum ActionType {
  Remove = 'Remove',
  Receive = 'Receive',
  UndoReceive = 'Undo Receive',
  EditData = 'Edit Data',
  Hold = 'Hold',
  Print = 'Print',
  VoidData = 'Void Data'
}
const CUSTOMER_DROP_OFF = 'Customer Drop-Off'
const PICKUP = 'Pickup'
const COURIER = 'Courier'

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
  standalone: false
})
export class ReceiptComponent implements OnInit, OnDestroy {
  readonly ICON = ICON;
  readonly TableType = TableType;
  @Output() onClose = new EventEmitter<void>();
  @Output() onRestart = new EventEmitter<void>();

  readonly customerTypes: CustomerType[] = this.appService.masterData.customerType;
  customerTypeSelected: CustomerType | undefined;
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  readonly goodsType: GoodsType[] = this.appService.masterData.goodsType;
  goodsTypeSelected: GoodsType | undefined;
  isDisabledGoodsType = false;
  readonly deliveryMode: DeliveryMode[] = this.appService.masterData.deliveryMode;
  deliveryModeSelected: DeliveryMode | undefined;

  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
  readonly vendors: Vendor[] = this.appService.masterData.entityMap.Vendor;
  vendorSelected: Vendor | undefined;
  behalfOfCusotmerSelected: Customer | undefined;
  // behalfOfVendorSelected: Vendor | undefined;
  contactPhone = '';
  contactPerson = ''

  signatureName = ''
  Signaturebase64Data = ''
  readonly signatureTypes: SignatureTypes[] = [
    { customerTypeID: 1, customerTypeName: 'Customer' }, { customerTypeID: 3, customerTypeName: 'Employee' },
  ]
  signatureEmployeeSelected: Employee | undefined;
  signaturePerson : string |null = null;
  signatureTypeSelected: SignatureTypes | undefined;
  signatureDate: Date = new Date();
  expectedDateTime: Date = new Date();
  format = "MM/dd/yyyy HH:mm";

  name: string = '';
  email: string | null = '';
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
  readonly lotIdentifiers = [
    { name: 'Test', id: 'Test' },
    { name: 'Test&Rel', id: 'Test&Rel' },
    { name: 'Rel', id: 'Rel' },
    { name: 'Customer Lot', id: 'Customer Lot' },
    { name: 'TBD', id: 'TBD' },
  ]
  lotIdentifierSelected: { name: string; id: string } | undefined;
  customerText: string = '';
  description: string = '';

  isHoldCheckboxEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == 'HoldCheckbox')?.active ?? true;
  isHoldCommentEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == "HoldComments")?.active ?? true;

  @ViewChild('noOfCartons', { static: false, }) noOfCartons: ElementRef | undefined;
  gridData = [
    {
      noOfCartons: undefined,
      isHold: false,
      holdComments: "",
      isHoldCheckboxEnabled: !this.isHoldCheckboxEnabled,
      isHoldCommentEnabled: !this.isHoldCommentEnabled
    }
  ];
  isExpected = false;
  isFTZ: boolean = false;
  isInterim: boolean = false;
  isDisabled: any = {
    clearReceipt: false,
    addReceipt: false,
    addDevice: false,
    addHardware: false,
    addMisc: false,
    cancelBtn: false,
    addInterim:false
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
  isPMRole:boolean = false;
  isReceiverOrMail:boolean = false;

  constructor(public appService: AppService, private apiService: ApiService) { 
    this.getInvUserByRole();
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
  isDisableReceipt = false;

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
        case "ISFTZ":
          this.isVisibleFTZ = aff.active;
          this.isDisableFTZ = !aff.isWriteOnly;
          break;
        case "ISInterim":
          this.isVisibleInterim = aff.active
          this.isDisableInterim = !aff.isWriteOnly;
          break;
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

      // this.employeesSelected = not coming in the respose
      this.comments = dataItem.pmComments;
      // auto select is diabled
      this.deliveryModeSelected = this.deliveryMode.find(c => c.deliveryModeID == dataItem.deliveryModeID);
      this.tracking = dataItem.trackingNumber || ''
      if (dataItem.courierDetailID) {
        this.courierSelected = this.couriers.find(c => c.courierDetailID == dataItem.courierDetailID)
      }
      if (dataItem.countryFromID) {
        this.countrySelected = this.countries.find(c => c.countryID == dataItem.countryFromID)
      }
      this.expectedDateTime = new Date(dataItem.expectedDateTime);
      this.deliveryComments = dataItem.mailComments;

      this.addressSelected = this.addresses.find(a => a.addressId == dataItem.addressID)

      this.gridData[0].noOfCartons = dataItem.noOfCartons
      this.gridData[0].isHold = dataItem.isHold
      this.gridData[0].holdComments = dataItem.holdComments

      this.signatureTypeSelected = this.signatureTypes.find(c => c.customerTypeName == dataItem.signaturePersonType);
      this.signatureEmployeeSelected = this.employees.find(e => e.EmployeeID == dataItem.signaturePersonID) || undefined;
      this.signaturePerson = dataItem.signaturePerson || null;
      this.signatureName = dataItem.signature
      this.Signaturebase64Data = dataItem.signaturebase64Data
      if (dataItem.signatureDate) {
        this.signatureDate = new Date(dataItem.signatureDate);
      }

      // this.goodsTypeSelected = this.goodsType.find(c => c.goodsTypeID == dataItem.goodsTypeID);
      this.address = dataItem.address
      this.email = dataItem.email || '';
      this.contactPhone = dataItem.contactPhone
      this.contactPerson = dataItem.contactPerson
      this.fetchReceiptEmployees()
      this.fetchData();

      if (dataItem.isInterim) {
        this.listInterimLots();
        this.fetchDataInterim();
      }
      debugger;
      if(this.appService.userName == 'PM') {
        this.isPMRole = true;
      }
      else if(this.appService.userName == 'Receiving' || this.appService.userName == 'Male') {
        this.isReceiverOrMail = true;      
      }
      else {
        this.isPMRole = this.isReceiverOrMail = true;
      }

      this.cartonsValueChange(dataItem.noOfCartons);
      

    } else {
      this.appService.sharedData.receiving.isEditMode = false
      this.appService.sharedData.receiving.isViewMode = false
      this.appService.sharedData.receiving.dataItem = {}

      this.isDisabledGoodsType = true;
      this.receiptLocationSelected = this.receiptLocation.find(e => e.receivingFacilityName == this.appService.facility)

    }
    if (this.appService.sharedData.receiving.isViewMode) {
      this.disabledAllBtns()
    }
    this.listFiles()
  }
  onChangeAddress() {
    if (this.addressSelected) {
      this.contactPhone = this.addressSelected.phone + ''
    }
  }
  private fetchData() {
    this.fetchDevicesByCustomer();
    this.fetchDataDevice();
    this.fetchDataHardware();
    this.fetchDataMiscellaneous();
  }

  currentBehalfID: any;
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
  private fetchDataInterim() {
    
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      return;
    }
    this.apiService.listInterimDevices(dataItem.receiptID).subscribe({
      next: (v: any) => {
        
        this.gridDataInterim = v;
        this.gridDataInterim.forEach((d, index) => {
          //d.employeeSelected = this.employees.find(e => e.EmployeeID == d.lotOwnerID);
          //d.countrySelected = this.countries.find(c => c.countryName == d.coo)
          d.deviceTypeSelected = this.deviceTypes.find(dt => dt.deviceTypeID == d.deviceTypeID)
          // if (index == 0) {
          //   this.lotCategorySelected = this.lotCategories.find(c => c.lotCategoryID == d.lotCategoryID)
          // }
          // if (d.lotIdentifier) {
          //   d.lotIdentifierSelected = this.lotIdentifiers.find(l => l.id == d.lotIdentifier);
          // }
          d.rowActionMenu = this.RowActionMenuDevice.map(o => ({ ...o }));
          d.interimLotSelected = this.interimLotsList.find(o => o.iseLotNumber == d.iseLotNumber);
        })

        if(this.gridDataInterim.length > 0)
          this.disableReceipt();
      }
    });
  }
  private fetchDataDevice() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      return;
    }
    this.apiService.getDeviceData(dataItem.receiptID,null).subscribe({
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
  private fetchDataHardware() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      return;
    }
    this.apiService.getHardwaredata(dataItem.receiptID).subscribe({
      next: (v: any) => {
        if (v) {
          
          this.gridDataHardware = v;
          this.gridDataHardware.forEach((d: any) => {
            d.hardwareTypeSelected = this.hardwareTypes.find(c => c.hardwareTypeID == d.hardwareTypeID)
            d.rowActionMenu = this.RowActionMenuDevice.map(o => ({ ...o }))
            d.rowActionMenu
          })
          
        if(this.gridDataHardware.length > 0)
          this.disableReceipt();
        }
      }
    });
  }
  gridDataMiscellaneous: MiscellaneousGoods[] = [];
  private fetchDataMiscellaneous() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      return;
    }
    this.apiService.getMiscellaneousGoods(dataItem.receiptID).subscribe({
      next: (v: any) => {
        this.gridDataMiscellaneous = v;
        this.gridDataMiscellaneous.forEach((d:any) => {
        d.rowActionMenu = this.RowActionMenuDevice.map(o=> ({...o}))
        })
        
        if(this.gridDataMiscellaneous.length > 0)
          this.disableReceipt();
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
      tracking: true
    }
  }
  testAddReceipt() {
    this.customerSelected = this.customers[0];
    this.customerTypeSelected = this.customerTypes[0];
    this.receiptLocationSelected = this.receiptLocation[0];
    this.employeesSelected = [this.employees[0]]

    this.deliveryModeSelected = this.deliveryMode[0];
    this.tracking = 'test tracking id'
    this.courierSelected = this.couriers[0]
    this.countrySelected = this.countries[0]

    this.comments = 'test comments ' + (Math.floor(Math.random() * 900) + 100);
    this.contactPerson = "Contact Person Name"
    this.contactPhone = '90 000 00 ' + (Math.floor(Math.random() * 900) + 100);
    this.address = 'NY'
    this.email = 'test@gmail.com'
  }
  addReceipt() {
    
    const data: PostReceipt = {
      ...INIT_POST_RECEIPT,

      ReceiptID: null,
      VendorID: null,
      VendorName: null,
      CustomerTypeID: this.customerTypeSelected?.customerTypeID || 1,
      CustomerVendorID: null,
      BehalfID: 1,
      ReceivingFacilityID: this.receiptLocationSelected?.receivingFacilityID || 1,
      DeliveryModeID: this.deliveryModeSelected?.deliveryModeID || 1,
      CourierDetailID: this.courierSelected?.courierDetailID || null,
      CountryFromID: this.countrySelected?.countryID || null,
      ContactPerson: this.contactPerson,
      ContactPhone: this.contactPhone,
      Email: this.email,
      ExpectedDateTime: this.appService.formattedDateTime2(this.expectedDateTime),
      AddressID: this.addressSelected?.addressId || null,
      MailComments: this.deliveryComments,
      PMComments: this.comments?.trim() || null,
      NoOfCartons: this.gridData[0].noOfCartons || 0,
      IsHold: this.gridData[0].isHold,
      HoldComments: this.gridData[0].holdComments || null,
      IsExpected: this.isExpected,
      IsInterim: this.isInterim,
      IsFTZ: this.isFTZ,
      MailStatus: null,
      ReceivingStatus: null,
      SignaturePersonType: this.signatureTypeSelected?.customerTypeName || '',
      SignaturePersonID: this.signatureEmployeeSelected?.EmployeeID || null,
      Signature: this.signatureName,
      Signaturebase64Data: this.Signaturebase64Data,
      SignatureDate: this.appService.formattedDateTime2(new Date()),
      RecordStatus: "I",
      Active: true,
      LoginId: this.appService.loginId,
      TrackingNumber: this.tracking,
      SignaturePerson: this.signaturePerson 
    }
    if (this.customerTypeSelected?.customerTypeName == 'Customer') {
      data.BehalfID = this.behalfOfCusotmerSelected?.CustomerID || null;
      if (this.customerSelected) {
        // custom value by user
        data.CustomerVendorID = this.customerSelected?.CustomerID
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
          data.VendorName = this.vendorSelected.VendorName;
        } else {
          data.CustomerVendorID = this.vendorSelected?.VendorID || null;
        }
        data.BehalfID = this.behalfOfCusotmerSelected?.CustomerID || null;
      } else {
        this.appService.errorMessage('Please select vendor');
        return;
      }
    }
    if (this.appService.sharedData.receiving.isEditMode) {
      data.RecordStatus = "U";
      const dataItem = this.appService.sharedData.receiving.dataItem;
      data.ReceiptID = dataItem.receiptID;
      // data = { ...this.appService.sharedData.receiving.dataItem, ...data, }
    } else {
      data.RecordStatus = "I";
      data.ReceiptID = null;
    }
    if (!this.customerTypeSelected) {
      this.appService.errorMessage('Please select customer/vendor');
      return;
    }

    if (!this.receiptLocationSelected) {
      this.appService.errorMessage('Please select Receiving Facility');
      return;
    }
    if (!this.PMReceiverSelected) {
      this.appService.errorMessage('Please select PM/Receivers');
      return;
    }
    if (!this.deliveryModeSelected) {
      this.receipt.isValid.deliveryMode = false;
      this.appService.errorMessage('Please select delivery mode');
      return;
    } else {
      this.receipt.isValid.contactPhone = true;
    }
    if ([CUSTOMER_DROP_OFF, PICKUP].includes(this.deliveryModeSelected?.deliveryModeName)) {
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
      if (data.NoOfCartons < 0) {
        this.appService.errorMessage('No. of cartons cannot be less than zero');
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
    if (this.deliveryModeSelected?.deliveryModeName == COURIER) {
      if (this.tracking) {
        this.receipt.isValid.tracking = true
      } else {
        this.receipt.isValid.tracking = false
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
    
    if(this.PMReceiverSelected){
      const PMRecev: Employee = { EmployeeID: this.PMReceiverSelected.employeeID, EmployeeName: this.PMReceiverSelected.employeeName,EmployeeEmail:this.PMReceiverSelected.email} 
      data.EmployeeDetail = [PMRecev];
    }

    this.doPostProcessReceipt(data);
  }
  private doPostProcessReceipt(postReceipt: PostReceipt) {
    
    const body = { ReceiptDetails: [postReceipt] }
    this.apiService.postProcessReceipt(body).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.onClose.emit();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
    });
  }

  // Interim
  public gridDataInterim: InterimItem[] = [];
  addRowInterim() {
    
    const dataItem = this.appService.sharedData.receiving.dataItem;
    this.gridDataInterim.splice(0, 0, {
      ...INIT_DEVICE_ITEM, receiptID: dataItem.receiptID, recordStatus: "I",
      rowActionMenu: this.RowActionMenuDeviceAdd.map(o => ({ ...o })),
      // @ts-ignore
      goodQty: null,
      // @ts-ignore
      receivedQTY: null,
      // @ts-ignore
      rejectedQty: null,
      isHold: false
    });
  }
  saveInterim() {
    
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!this.gridDataInterim || !this.gridDataInterim.length) {
      this.appService.infoMessage(MESSAGES.NoChanges)
    }
    const filteredRecords = this.gridDataInterim.filter(d => d.recordStatus == "I" || d.recordStatus == "U")
    if (!filteredRecords || filteredRecords.length < 1) {
      this.appService.infoMessage(MESSAGES.NoChanges);
      return;
    }
    const InterimDeviceDetails: InterimDevice[] = []
    
    for (let index = 0; index < filteredRecords.length; index++) {
      const r = filteredRecords[index];
      
      if (!r.interimLotSelected) {
        r.error = true;
        this.appService.errorMessage("ISE Lot# is required!");
        return;
      }
      
      if (r.isReceived == true) {
        
        const mandatoryFields = [ r.receivedQTY, r.goodQty, r.receivedQTY ]
        const isValid = mandatoryFields.some(v => v > 0);
        if(isValid != true) {
          r.error = true;
          this.appService.errorMessage("ReceivedQTY, GoodQty, ReceivedQTY should be greater than zero!")
          return;
        }
        
        // const recevQtyStr = r.receivedQTY.toString() || ''
        // const recevQty = parseInt(recevQtyStr);
        // const goodQtyStr = r.goodQty.toString() || '';
        // const goodQty = parseInt(goodQtyStr);
        // const rejQtyStr = r.goodQty.toString() || '';
        // const rejQty = parseInt(rejQtyStr);
      
        // if (recevQty != (goodQty + rejQty)) {
        //   r.isHold = true;
        // } else {
        //   r.isHold = false
        // }
      }
      else if (r.isReceived == false) {

      }

      const postInterimDevice: InterimDevice = {
        InventoryID: r.interimLotSelected?.inventoryID || 0,
        InterimReceiptID: r.receiptID,
        RecordStatus: r.recordStatus || 'I',
        UserID:this.appService.loginId,
        ReceivedQTY:r.receivedQTY,
        GoodQty:r.goodQty,
        RejectedQty:r.rejectedQty,
        InterimStatusID: r.isReceived == true ? 1 : 0,
        IsReceived: r.isReceived == undefined ? false : r.isReceived,
        IsHold: r.isHold,
        Active: r.active
      }

      InterimDeviceDetails.push(postInterimDevice)
    }
    
  this.apiService.postInterim(InterimDeviceDetails[0]).subscribe({
      next: (v: any) => {

        this.appService.successMessage(MESSAGES.DataSaved);
        this.fetchDataInterim();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
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
  // addDevice
  public gridDataDevice: DeviceItem[] = [];
  saveDevices() {
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
  addRowDevice() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    this.appService.isLoading = true;
    this.apiService.generateLineItem().subscribe({
      next: (v: any) => {
        this.appService.isLoading = false;
        this.gridDataDevice.splice(0, 0, {
          ...INIT_DEVICE_ITEM, receiptID: dataItem.receiptID, recordStatus: "I",
          lotIdentifierSelected: this.lotIdentifiers[0],
          lotIdentifier: this.lotIdentifiers[0].id,
          iseLotNumber: v.data + '',
          rowActionMenu: this.RowActionMenuDeviceAdd.map(o => ({ ...o }))
        });
      },
      error: (e: any) => {
        this.appService.isLoading = false;
        this.appService.errorMessage('Unable to add new device row');
      }
    })
  }
  addHardwareRow() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    this.gridDataHardware.splice(0, 0, { ...INIT_HARDWARE_ITEM, receiptID: dataItem.receiptID, recordStatus:'I',
      rowActionMenu: this.RowActionMenuDeviceAdd.map(o=> ({...o}))
     })
  }
  addMiscellaneousRow() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    this.gridDataMiscellaneous.splice(0, 0, { ...INIT_MISCELLANEOUS_GOODS, receiptID: dataItem.receiptID, recordStatus:'I',
      rowActionMenu: this.RowActionMenuDeviceAdd.map(o => ({...o}))
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

  saveHardwares() {
    if (!this.gridDataHardware.length) {
      if (this.hardware.isItemsRemoved) {
        this.doPostProcessHardware([]);
      } else {
        this.appService.infoMessage(MESSAGES.NoChanges)
      }
      return;
    }
    const filteredRecords = this.gridDataHardware.filter(d => d.recordStatus == "I" || d.recordStatus == "U")
    if (!filteredRecords || filteredRecords.length < 1) {
      this.appService.infoMessage(MESSAGES.NoChanges);
      return;
    }

    var isEmpty = filteredRecords.find(r => !r.customerHardwareID);
    if (isEmpty) {
      isEmpty.error = true;
      this.appService.errorMessage("Please enter Customer Hardware ID");
      return;
    }
    var isEmpty = filteredRecords.find(r => !r.expectedQty);
    if (isEmpty) {
      isEmpty.error = true;
      this.appService.errorMessage("Please enter expected quantity");
      return;
    }
    var isEmpty = filteredRecords.find(r => !r.hardwareTypeSelected);
    if (isEmpty) {
      isEmpty.error = true;
      this.appService.errorMessage("Please select hardware type");
      return;
    }
    const HardwareDetails: PostHardware[] = [];
    filteredRecords.forEach((r) => {
      if (r.hardwareTypeSelected) {
        r.hardwareTypeID = r.hardwareTypeSelected?.hardwareTypeID
      }
      const postHardware: PostHardware = {
        HardwareID: r.hardwareID,
        ReceiptID: r.receiptID,
        CustomerHardwareID: r.customerHardwareID,
        HardwareTypeID: r.hardwareTypeID || 10,
        ExpectedQty: r.expectedQty || 1,
        RecordStatus: r.recordStatus,
        Active: r.active,
        LoginId: this.appService.loginId,
        IsReceived: r.isReceived == undefined ? false : r.isReceived
      }
      if (postHardware.RecordStatus == "I") {
        postHardware.HardwareID = null;
      }
      HardwareDetails.push(postHardware)
    })
    this.doPostProcessHardware(HardwareDetails);
  }
  saveMiscellaneous() {
    if (!this.gridDataMiscellaneous || !this.gridDataMiscellaneous.length) {
      this.appService.infoMessage(MESSAGES.NoChanges)
      return;
    }
    const filteredRecords = this.gridDataMiscellaneous.filter(d => d.recordStatus == "I" || d.recordStatus == "U")
    if (!filteredRecords || filteredRecords.length < 1) {
      this.appService.infoMessage(MESSAGES.NoChanges);
      return;
    }
    const isEmpty = filteredRecords.find(r => !r.additionalInfo);
    if (isEmpty) {
      isEmpty.error = true;
      this.appService.errorMessage("Please enter Additional Info");
      return;
    }
    const MiscGoodsDetails: PostMiscGoods[] = []
    filteredRecords.forEach((r) => {
      const postMiscGoods: PostMiscGoods = {
        MiscellaneousGoodsID: r.miscellaneousGoodsID || null,
        ReceiptID: r.receiptID,
        AdditionalInfo: r.additionalInfo,
        RecordStatus: r.recordStatus || "U",
        Active: r.active,
        LoginId: this.appService.loginId,
        IsReceived: r.isReceived == undefined ? false : r.isReceived
      }
      MiscGoodsDetails.push(postMiscGoods);
    })
    this.apiService.postProcessMiscellaneous({ MiscGoodsDetails }).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.fetchDataMiscellaneous();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
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
  readonly customer : Customer[] = this.appService.masterData.entityMap.Customer
  customerSelect: Customer[]=[];
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

  doTestEditMode() {
    // this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.gridDataHardware[3], 'Device');
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent, dataItem: any, rowIndex: number, tableName: 'Device' | 'Hardware' | 'Misc' |'Interim') {
    switch (e.item.text) {
      case 'Edit Data': 
      this.doEditRow(dataItem, tableName);
        break;
      case 'Receive':
        this.receiveRow(dataItem,tableName);
        break;
      case 'Undo Receive':
        this.canUndoReceive(dataItem, tableName);
        break;
      case 'Hold':
        this.doHoldUnHold(dataItem, tableName);
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

    this.enableDisableRowMenuItems(dataItem, tableType);
  }

  enableDisableRowMenuItems(dataItem:any, tableName: 'Device' | 'Hardware' | 'Misc' |'Interim'){
    
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
    
    switch (tableName) {
      case 'Hardware':
      case 'Misc':
        if(holdMenuItem)
          holdMenuItem.disabled = true;
        break;
      case 'Interim':
        if(editMenuItem)
          editMenuItem.disabled = true;
        if(holdMenuItem)
          holdMenuItem.disabled = true;
        break;
    }
  }

  doEditRow(dataItem:any, tableName: 'Device' | 'Hardware' | 'Misc'|'Interim') {
    switch(tableName){
      case 'Device' :
        dataItem.recordStatus = 'U'
        dataItem.dateCode = parseInt(dataItem.dateCode);
      break;
      case 'Hardware':
      case 'Misc':
      case 'Interim':
        dataItem.recordStatus = 'U'
    }
  }
  private doRemoveRow(rowIndex: number, tableName: 'Device' | 'Hardware' | 'Misc'|'Interim') {
    switch (tableName) {
      case 'Device':
        this.gridDataDevice.splice(rowIndex, 1);
        break;
      case 'Hardware':
        this.gridDataHardware.splice(rowIndex, 1);
        this.hardware.isItemsRemoved = true
        break;
      case 'Misc':
        this.gridDataMiscellaneous.splice(rowIndex, 1);
        break;
      case 'Interim':
      this.gridDataInterim.splice(rowIndex, 1);
      break;
    }
  }
  private doPrint(r: any, tableName: 'Device' | 'Hardware' | 'Misc' | 'Interim') {
    switch (tableName) {
      case 'Device':
        const filteredData = this.getFilteredPrintData(r);
        const formattedHTML = this.generatePrintHTML(filteredData);
        this.printPreview(formattedHTML);
        break;
    }
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
  
  private doVoidData(r: any, rowIndex: number, tableName: 'Device' | 'Hardware' | 'Misc' | 'Interim') {
    switch (tableName) {
      case 'Device':
        this.setLineItemToVoid(this.gridDataDevice,rowIndex);
        this.saveDevices();
        break;
      case 'Hardware':
        this.setLineItemToVoid(this.gridDataHardware, rowIndex);
        this.saveHardwares();
        break;
      case 'Misc':
        this.setLineItemToVoid(this.gridDataMiscellaneous, rowIndex);
        this.saveMiscellaneous();
        break;
      case 'Interim':
        this.setLineItemToVoid(this.gridDataInterim, rowIndex);
        this.saveInterim();
    }
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
  isDisabledBehalfOfCusotmer = false
  onChangeCustomerType() {
    if (this.customerTypeSelected?.customerTypeName == 'Customer') {
      this.isDisabledBehalfOfCusotmer = true
    } else {
      this.isDisabledBehalfOfCusotmer = false
    }
  }
  onChangeCustomerName() {
    if (this.customerTypeSelected?.customerTypeName == 'Customer') {
      this.isDisabledBehalfOfCusotmer = true
      this.behalfOfCusotmerSelected = this.customerSelected;
    }
    this.onChangeBehalfOfCusotmer();
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
  onChangeHoldComments() {
    this.gridData[0].holdComments = this.gridData[0].holdComments?.trim()
    if (this.gridData[0].holdComments) {
      this.gridData[0].isHold = true
    } else {
      this.gridData[0].isHold = false
    }
  }
  onClearForm() {
    this.isFTZ = false;
    this.isInterim = false;
    this.isExpected = false;

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

    this.gridData[0].noOfCartons = undefined
    this.gridData[0].isHold = false
    this.gridData[0].holdComments = ''

    this.signatureTypeSelected = undefined
    this.signatureEmployeeSelected = undefined
    this.signatureName = ''
    this.signatureDate = new Date();

    this.goodsTypeSelected = undefined
    this.address = ''
    this.email = ''
    this.contactPhone = ''
    this.contactPerson = ''
    this.employeesSelected = [];
  }
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

        this.gridData[0].noOfCartons,
        this.gridData[0].holdComments,

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
  fileRestrictions: FileRestrictions = {
    allowedExtensions: [".jpg", ".png", ".jpeg"],
    minFileSize: 1024 // in bytes , 1024*1024 1MB
  };
  onSelect(event: any): void {
    // Get selected files count
  }

  onUpload(event: any): void {
    // Send selected files to API
    const formData = new FormData();
    event.files.forEach((file: any) => {
      formData.append('files', file.rawFile);
    });
    // Call API
  }
  uploadFiles(upFiles: FileSelectComponent) {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      return;
    }
    const files = upFiles.fileList.files;
    if (files && files.length) {
      const file = files[0][0].rawFile;
      if (!file) {
        this.appService.errorMessage('Error while selecting file');
        return;
      }

      const inputFilename = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
      const receiptNumber = dataItem.receiptID; // You can generate or get this value dynamically

      this.apiService.uploadFile(file, inputFilename, receiptNumber, this.appService.loginId).subscribe({
        next: (v: any) => {
          this.appService.successMessage('Success: File uploaded!');
          upFiles.clearFiles();
          this.listFiles();
        },
        error: (v: any) => {
          this.appService.errorMessage('Error while uploading file')
        }
      });
    } else {
      this.appService.errorMessage('Please select file to upload')
    }
  }
  receiptAttachments: ReceiptAttachment[] = []
  private listFiles() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      return;
    }
    this.apiService.listFiles(dataItem.receiptID).subscribe({
      next: (v: any) => {
        this.receiptAttachments = v;
      }
    })
  }
  readonly downloadFileApi = environment.apiUrl + 'v1/ise/inventory/download/'
  downloadFile(d: ReceiptAttachment) {
    this.apiService.downloadFile(d.path).subscribe();
  }
  deleteFile(d: ReceiptAttachment) {
    d.active = false;
    this.apiService.deleteFile(d).subscribe({
      next: (v: any) => {
        this.appService.successMessage('Success: File deleted!')
        this.listFiles();
      },
      error: (v: any) => {
        this.appService.errorMessage('Error: Unable to delete file')
      }
    })
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
        else{
          if(this.appService.userName == 'PM') {
            this.PMReceiverSelected = this.PMReceivers.find(e => e.employeeID == this.appService.loginId)
          }
        }
      }
    });
  }
  onLotValueChange(selectLot: any, dataItem:InterimItem, indx :any): void {
    
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

  canUndoReceive(dataItem:any, tableName: 'Device' | 'Hardware' | 'Misc' | 'Interim') {
    
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

  private receiveRow(dataItem: any, tableName: 'Device' | 'Hardware' | 'Misc'|'Interim') {
    switch (tableName) {
      case 'Device':
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
      case 'Hardware':
      case 'Misc':
      case 'Interim':
        this.receiveLineItem(dataItem);
      break;
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

  doHoldUnHold(dataItem:any, tableName: 'Device' | 'Hardware' | 'Misc'|'Interim') {
  
    switch(tableName){
    case 'Device':
      dataItem.isHold = !dataItem.isHold
      break;
    case 'Hardware':
      break;
    case 'Misc':
      break;
    case 'Interim':
      break;
    }
  }

  disableReceipt() {
    
    const interimItemReceived: boolean  = this.gridDataInterim.find(o => o.isReceived == true) == undefined ? false : true
    const deviceItemReceived: boolean  = this.gridDataDevice.find(o => o.isReceived == true) == undefined ? false : true
    const hardwareItemReceived: boolean  = this.gridDataHardware.find(o => o.isReceived == true) == undefined ? false : true
    const miscItemReceived: boolean  = this.gridDataMiscellaneous.find(o => o.isReceived == true) == undefined ? false : true

    if(interimItemReceived == true || deviceItemReceived == true || hardwareItemReceived == true || miscItemReceived == true) {
      this.isDisableHoldComments = true;
    }
    else {
      this.isDisableHoldComments = false;
    }
  }
  onCartonsValueChange(value:any) {
    this.cartonsValueChange(value);
  }

  cartonsValueChange(value:any) {
    
    const cartonsStr = value.toString() || ''
    const noOfCarts = parseInt(cartonsStr);
    if(noOfCarts && noOfCarts > 0) {
      this.isDisableReceipt = true;
    }
    else{
      this.isDisableReceipt = false;
    }
  }
}
