import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Address, Customer, CustomerType, DeliveryMode, DeviceItem, Employee, EntityType, GoodsType, HardwareItem, ICON, INIT_DEVICE_ITEM, INIT_HARDWARE_ITEM, INIT_MISCELLANEOUS_GOODS, INIT_POST_RECEIPT, JSON_Object, MESSAGES, MiscellaneousGoods, PostHardware, PostReceipt, ReceiptLocation } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent implements OnInit, OnDestroy {
  readonly ICON = ICON;
  customerTypes: CustomerType[] = []
  customerTypeSelected: CustomerType | undefined;
  receiptLocation: ReceiptLocation[] = []
  receiptLocationSelected: ReceiptLocation | undefined;
  goodsType: GoodsType[] = []
  goodsTypeSelected: GoodsType | undefined;
  deliveryMode: DeliveryMode[] = []
  deliveryModeSelected: DeliveryMode | undefined;

  customer: Customer[] = []
  customerSelected: Customer | undefined;
  behalfOfCusotmerSelected: Customer | undefined;
  customerTextField: 'CustomerName' | 'VendorName' = 'CustomerName'
  customerValueField: 'CustomerID' | 'VendorID' = 'CustomerID'

  contactPhone = '';
  contactPerson = ''

  signatureName = ''
  signatureEmployeeSelected: Employee | undefined;
  signatureTypeSelected: CustomerType | undefined;
  signatureDate: Date = new Date();
  expectedDateTime: Date = new Date();
  format = "MM/dd/yyyy HH:mm";

  name: string = '';
  email: string = '';
  comments: string = '';
  deliveryComments: string = '';
  address: any;
  addresses: Address[] = []
  addressSelected: Address | undefined;
  countries = this.appService.m.Country
  countrySelected: any;
  couriers = this.appService.m.CourierDetails
  courierSelected: any

  description: string = '';
  onBlur(event: any) {
    event.stopPropagation();
  }
  isHoldCheckboxEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == 'HoldCheckbox')?.active ?? false;
  isHoldCommentEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == "HoldComments")?.active ?? false;

  gridData = [
    {
      noOfCartons: undefined,
      isHold: false,
      holdComments: "",
      isHoldCheckboxEnabled: !this.isHoldCheckboxEnabled,
      isHoldCommentEnabled: !this.isHoldCommentEnabled
    }
  ];

  expectedOrNot: 'Expected' | 'Unexpected' = 'Expected'
  isFTZ: boolean = false;
  isInterim: boolean = false;
  isDisabled: any = {
    clearReceipt: false,
    addReceipt: false,
    addDevice: false,
    addHardware: false,
    submitBtn: false,
    cancelBtn: false
  }
  tracking = ''
  readonly hardwareTypes = this.appService.hardwareTypes ;

  constructor(private appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.init();
  }
  ngOnDestroy(): void {
    this.appService.sharedData.receiving.isEditMode = false
    this.appService.sharedData.receiving.isViewMode = false;
  }
  private init() {
    this.employees = this.appService.masterData.entityMap.Employee;
    this.customerTypes = this.appService.masterData.customerType;
    console.log(this.customerTypes);
    // if (!this.customerTypes.find(c => c.customerTypeName == 'Employee')) {
    //   this.customerTypes.push({
    //     customerTypeID: 3,
    //     customerTypeName: 'Employee'
    //   })
    // }
    this.customer = this.appService.masterData.entityMap.Customer;
    // this.receiptLocation = this.appService.masterData.receiptLocation; temp
    this.receiptLocation = this.appService.m.ReceiptLocation;
    this.deliveryMode = this.appService.masterData.deliveryMode;
    this.goodsType = this.appService.masterData.goodsType;
    this.addresses = this.appService.masterData.addresses;

    if (this.appService.sharedData.receiving.isViewMode || this.appService.sharedData.receiving.isEditMode) {
      const dataItem = this.appService.sharedData.receiving.dataItem;

      this.isFTZ = dataItem.isFTZ;
      this.isInterim = dataItem.isInterim;
      this.expectedOrNot = dataItem.isExpected ? 'Expected' : 'Unexpected';

      this.customerTypeSelected = this.customerTypes.find(c => c.customerTypeID == dataItem.customerTypeID);
      this.customerSelected = this.customer.find(c => c.CustomerID == dataItem.customerVendorID);
      this.receiptLocationSelected = this.receiptLocation.find(c => c.receiptLocationID == dataItem.receivingFacilityID);
      this.behalfOfCusotmerSelected = this.customer.find(c => c.CustomerID == dataItem.behalfID);

      // this.employeesSelected = not coming in the respose
      this.comments = dataItem.pmComments;
      this.deliveryModeSelected = this.deliveryMode.find(c => c.deliveryModeID == dataItem.deliveryModeID);
      // this.tracking = dataItem. not coming
      if (dataItem.courierDetailID) {
        this.courierSelected = this.couriers.find(c => c.CourierDetailID == dataItem.courierDetailID)
      }
      if (dataItem.countryFromID) {
        this.countrySelected = this.countries.find(c => c.CountryID == dataItem.countryFromID)
      }
      this.expectedDateTime = new Date(dataItem.expectedDateTime);
      this.deliveryComments = dataItem.mailComments;

      this.addressSelected = this.addresses.find(a => a.addressId == dataItem.addressID)

      this.gridData[0].noOfCartons = dataItem.noOfCartons
      this.gridData[0].isHold = dataItem.isHold
      this.gridData[0].holdComments = dataItem.holdComments

      this.signatureTypeSelected = this.customerTypes.find(c => c.customerTypeID == dataItem.signaturePersonID);
      this.signatureEmployeeSelected = this.employees.find(e => e.EmployeeID == dataItem.signaturePersonID)
      this.signatureName = dataItem.signature
      if (dataItem.signatureDate) {
        this.signatureDate = new Date(dataItem.signatureDate);
      }

      this.goodsTypeSelected = this.goodsType.find(c => c.goodsTypeID == dataItem.goodsTypeID);
      this.address = dataItem.address
      this.email = dataItem.email
      this.contactPhone = dataItem.contactPhone
      this.contactPerson = dataItem.contactPerson
      this.fetchReceiptEmployees()
    }
    this.fetchData();
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
    this.fetchDataDevice();
    this.fetchDataHardware();
    this.fetchDataMiscellaneous();
  }
  private fetchDataDevice() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      return;
    }
    // dataItem.receiptID = 1;// for testing
    this.apiService.getDeviceData(dataItem.receiptID).subscribe({
      next: (v: any) => {
        this.gridDataDevice = v;
        this.goodsTypeSelected = this.goodsType.find(v => v.goodsTypeName == 'Device')
        console.log(v);
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
        console.log(v);
        if (v) {
          v.forEach((h: any) => {
            h.hardwareTypeSelected = this.hardwareTypes.find(c => c.hardwareTypeID == h.hardwareTypeID)
            h.customerSelected = this.customer.find(c => c.CustomerID == h.customerID)
          })
        }
        this.gridDataHardware = v;
        // this.goodsTypeSelected = this.goodsType.find(v => v.goodsTypeName == 'Hardware')        
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
    // dataItem.receiptID = 1; // for testing
    this.apiService.getMiscellaneousGoods(dataItem.receiptID).subscribe({
      next: (v: any) => {
        console.log(v);
        this.gridDataMiscellaneous = v;
        // this.goodsTypeSelected = this.goodsType.find(v => v.goodsTypeName == 'Miscellaneous Goods')
      }
    });
  }
  private fetchReceiptEmployees() {
    const dateItem = this.appService.sharedData.receiving.dataItem;
    this.apiService.getReceiptEmployees(dateItem.receiptID).subscribe({
      next: (value: any) => {
        console.log(value);
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
    this.customerSelected = this.customer[0];
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
      CustomerVendorID: this.customerSelected?.CustomerID || 1,
      BehalfID: this.behalfOfCusotmerSelected?.CustomerID || 1,
      ReceivingFacilityID: this.receiptLocationSelected?.receiptLocationID || 1,
      DeliveryModeID: this.deliveryModeSelected?.deliveryModeID || 1,
      CourierDetailID: this.courierSelected?.CourierDetailID,
      CountryFromID: this.countrySelected?.CountryID,
      ContactPerson: this.contactPerson,
      ContactPhone: this.contactPhone,
      Email: this.email,
      ExpectedDateTime: this.appService.formattedDateTime(this.expectedDateTime.toISOString()),
      AddressID: 1,
      MailComments: this.deliveryComments,
      PMComments: this.comments.trim() || null,
      NoOfCartons: this.gridData[0].noOfCartons || 0,
      IsHold: this.gridData[0].isHold,
      HoldComments: this.gridData[0].holdComments || null,
      IsExpected: this.expectedOrNot == 'Expected',
      IsInterim: this.isInterim,
      IsFTZ: this.isFTZ,
      MailStatus: null,
      ReceivingStatus: null,
      SignaturePersonType: this.signatureEmployeeSelected?.EmployeeName || '',
      SignaturePersonID: this.signatureEmployeeSelected?.EmployeeID || 1,
      Signature: this.signatureName,
      SignatureDate: this.appService.formattedDateTime(new Date().toISOString()),
      RecordStatus: "I",
      Active: true,
      LoginId: this.appService.loginId,
      EmployeeDetail: this.employeesSelected
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
    console.log(data);
    if (!this.customerTypeSelected) {
      this.appService.errorMessage('Please select customer/vendor');
      return;
    }
    if (!this.customerSelected) {
      this.receipt.isValid.customer = false;
      this.appService.errorMessage('Please select customer');
      return;
    } else {
      this.receipt.isValid.customer = true;
    }

    if (!this.receiptLocationSelected) {
      this.appService.errorMessage('Please select Receiving Facility');
      return;
    }
    if (!this.employeesSelected) {
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
    if (['Drop Off', 'Pick Up'].includes(this.deliveryModeSelected?.deliveryModeName)) {
      if (!this.contactPhone) {
        this.receipt.isValid.contactPhone = false;
        this.appService.errorMessage('Please enter contact phone');
        return;
      } else {
        this.receipt.isValid.customer = true;
      }
      if (!this.contactPerson) {
        this.receipt.isValid.contactPerson = false;
        this.appService.errorMessage('Please enter contact person');
        return;
      } else {
        this.receipt.isValid.contactPerson = true;
      }
    }
    console.log(this.addressSelected);
    if (this.deliveryModeSelected?.deliveryModeName == 'Pick Up') {

      if (!this.addressSelected) {
        this.receipt.isValid.address = false;
        this.appService.errorMessage('Please select address');
        return;
      } else {
        this.receipt.isValid.address = true;
      }
    }
    if (this.deliveryModeSelected?.deliveryModeName == 'Courier') {
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

    this.doPostProcessReceipt(data);
  }
  private doPostProcessReceipt(data: JSON_Object) {
    const body = { ReceiptDetails: [data] }

    this.apiService.postProcessReceipt(body).subscribe({
      next: (v: any) => {
        console.log({ v });
        this.appService.successMessage(MESSAGES.DataSaved);
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }

  // addDevice
  public gridDataDevice: DeviceItem[] = [];
  addDevice() {
    if (this.gridDataDevice && this.gridDataDevice.length) {
      const data: any = {
        // ... this.gridDataDevice[this.device.rowIndex]
      }
      // if (this.device.isEditMode) {
      //   // @ts-ignore
      //   data.recordStatus = "U";
      // }
      // if (this.device.isAddMode) {
      //   // @ts-ignore
      //   data.recordStatus = "I";
      //   // @ts-ignore
      //   data.deviceID = null
      // }
      console.log(data);
      const mandatoryFields = [
        data.iseLotNum, data.customerLotNum, data.expectedQty, data.partNum, data.labelCount,
        data.coo, data.dateCode, data.holdComments
      ]
      const isValid = !mandatoryFields.some(v => !v);
      console.log({ isValid });
      if (isValid) {
        this.doPostProcessDevice(data);
      } else {
        this.appService.errorMessage("All fields are required!")
      }
    }
  }
  saveDevices() {
    if (this.gridDataDevice && this.gridDataDevice.length) {
      console.log(this.gridDataDevice);
      this.doPostProcessDevices()
    }
  }
  private doPostProcessDevices() {
    const filteredRecords = this.gridDataDevice.filter(d => d.recordStatus == "I" || d.recordStatus == "U")
    if (!filteredRecords || filteredRecords.length < 1) {
      this.appService.infoMessage(MESSAGES.NoChanges);
      return;
    }
    filteredRecords.forEach((r: any) => {
      r.loginId = this.appService.loginId
      if (r.recordStatus == "I") {
        r.deviceID = null;
      }
    })
    const body = { deviceDetails: filteredRecords }
    console.log(filteredRecords);
    console.log(filteredRecords[0]);

    this.apiService.postProcessDevice(body).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.fetchDataDevice();
        console.log({ v });
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }
  addDeviceRow() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    this.gridDataDevice.splice(0, 0, { ...INIT_DEVICE_ITEM, receiptID: dataItem.receiptID, recordStatus: "I" })
  }
  addHardwareRow() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    this.gridDataHardware.splice(0, 0, { ...INIT_HARDWARE_ITEM, receiptID: dataItem.receiptID })
  }
  addMiscellaneousRow() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    this.gridDataMiscellaneous.splice(0, 0, { ...INIT_MISCELLANEOUS_GOODS, receiptID: dataItem.receiptID })
  }
  private doPostProcessDevice(data: JSON_Object) {
    const body = {
      "deviceDetails": [
        {
          "deviceID": 0,
          "inventoryID": 0,
          "receiptID": 0,
          "iseLotNum": "string",
          "customerLotNum": "string",
          "expectedQty": 0,
          "expedite": true,
          "partNum": "string",
          "labelCount": 0,
          "coo": "string",
          "dateCode": 0,
          "isHold": true,
          "holdComments": "string",
          "createdOn": "2024-09-02T03:38:12.175Z",
          "modifiedOn": "2024-09-02T03:38:12.175Z",
          "active": true,
          ...data
        }
      ]
    }
    this.apiService.postProcessDevice(body).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.fetchDataDevice();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }
  // addHardware
  gridDataHardware: HardwareItem[] = []
  addHardware() {
    const data: any = {
      // ... this.gridDataHardware[this.hardware.rowIndex],
      loginId: this.appService.loginId
    }
    // if (this.hardware.isEditMode) {
    //   // @ts-ignore
    //   data.recordStatus = "U";
    // }
    // if (this.hardware.isAddMode) {
    //   // @ts-ignore
    //   data.recordStatus = "I";
    //   // @ts-ignore
    //   data.hardwareID = null
    // }
    console.log(data);
    if (data.serialNumber && data.expectedQty && data.hardwareType) {
      this.doPostProcessHardware(data);
    } else {
      this.appService.errorMessage("All fields are required!")
    }
  }
  private doPostProcessHardware(data: JSON_Object) {
    const body: any = {
      "hardwareDetails": [
        {
          "hardwareID": 0,
          "receiptID": 0,
          "inventoryID": 0,
          "hardwareType": "string",
          "customerID": 0,
          "customer": "string",
          "serialNumber": "string",
          "expectedQty": 0,
          "createdOn": "2024-09-02T03:38:12.178Z",
          "modifiedOn": "2024-09-02T03:38:12.178Z",
          "active": true,
          ...data
        }
      ]
    }
    this.apiService.postProcessHardware(body).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        console.log({ v });
        this.fetchDataHardware();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }
  saveHardwares() {
    if (!this.gridDataHardware || !this.gridDataHardware.length) {
      this.appService.infoMessage(MESSAGES.NoChanges)
    }
    const filteredRecords = this.gridDataHardware.filter(d => d.recordStatus == "I" || d.recordStatus == "U")
    if (!filteredRecords || filteredRecords.length < 1) {
      this.appService.infoMessage(MESSAGES.NoChanges);
      return;
    }
    const HardwareDetails: PostHardware[] = [];
    filteredRecords.forEach((r: any) => {
      r.loginId = this.appService.loginId
      if (r.customerSelected) {
        r.customerID = r.customerSelected?.CustomerID;
      }
      if(r.hardwareTypeSelected) {
        r.hardwareTypeID = r.hardwareTypeSelected?.hardwareTypeID
      }
      const postHardware: PostHardware = {
        HardwareID: r.hardwareID,
        ReceiptID: r.receiptID,
        CustomerID: r.customerID,
        HardwareTypeID: r.hardwareTypeID || 10,
        ExpectedQty: r.expectedQty,
        RecordStatus: r.recordStatus,
        Active: r.active,
        LoginId: r.loginId
      }
      if (postHardware.RecordStatus == "I") {
        // @ts-ignore
        postHardware.HardwareID = null;
      }
      HardwareDetails.push(postHardware)
    })
    const body = { HardwareDetails }
    console.log(filteredRecords);
    console.log(filteredRecords[0]);

    this.apiService.postProcessHardware(body).subscribe({
      next: (v: any) => {
        console.log({ v });
        this.appService.successMessage(MESSAGES.DataSaved);
        this.fetchDataHardware();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }
  saveMiscellaneous() {
    if (!this.gridDataMiscellaneous || !this.gridDataMiscellaneous.length) {
      this.appService.infoMessage(MESSAGES.NoChanges)
    }
    const filteredRecords = this.gridDataMiscellaneous.filter(d => d.recordStatus == "I" || d.recordStatus == "U")
    if (!filteredRecords || filteredRecords.length < 1) {
      this.appService.infoMessage(MESSAGES.NoChanges);
      return;
    }
    filteredRecords.forEach((r: any) => { r.loginId = this.appService.loginId })
    const body = { miscGoodsDetails: filteredRecords }
    console.log(filteredRecords);
    console.log(filteredRecords[0]);

    this.apiService.postProcessMiscellaneous(body).subscribe({
      next: (v: any) => {
        console.log({ v });
        this.appService.successMessage(MESSAGES.DataSaved);
        this.fetchDataMiscellaneous();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }
  public selectedValues: string = "";
  employees: Employee[] = []
  employeesSelected: Employee[] = [];
  public listItems: Array<string> = [
    "Baseball",
    "Basketball",
    "Cricket",
    "Field Hockey",
    "Football",
    "Table Tennis",
    "Tennis",
    "Volleyball",
  ];
  public gridStyle = {
    backgroundColor: 'green'
  };
  public areaList: Array<string> = [
    "Amsterdam",
    "Athens",
    "Barcelona",
    "Berlin",
    "Brussels",
    "Chicago",
    "Copenhagen",
    "Dublin",
    "Helsinki",
    "Houston",
    "Lisbon",
    "London",
    "Los Angeles",
    "Madrid",
    "Miami",
    "Montreal",
    "New York",
    "Paris",
    "Philadelphia",
    "Prague",
    "Rome",
    "Sao Paulo",
    "Seattle",
    "Stockholm",
    "Toronto",
    "Vancouver",
    "Vienna",
    "Vienna",
    "Warsaw",
  ];

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
  ];
  rowActionMenuDevice: MenuItem[] = [
    { text: 'Receive', svgIcon: ICON.cartIcon },
    { text: 'Undo Receive', svgIcon: ICON.cartIcon, disabled: true },
    { text: 'Print', svgIcon: ICON.printIcon },
    { text: 'Hold', svgIcon: ICON.kpiStatusHoldIcon },
    { text: 'Edit Data', svgIcon: ICON.pencilIcon },
  ]

  doTestEditMode() {
    this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.gridDataHardware[3], 'Device');
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent, dataItem: any, tableName: 'Device' | 'Hardware' | 'Misc') {
    console.log(e); console.log(dataItem);
    switch (e.item.text) {
      case 'Edit Data':
        dataItem.recordStatus = 'U'
        break;
      case 'Receive':
        this.rowActionMenuDevice[0].disabled = true;
        this.rowActionMenuDevice[1].disabled = false;
        break;
      case 'Undo Receive':
        this.rowActionMenuDevice[0].disabled = false;
        this.rowActionMenuDevice[1].disabled = true;
        break;
      case 'Hold':
        dataItem.isHold = !dataItem.isHold
        break;
      case 'Void Data':
        console.log(tableName)
        this.doVoidData(dataItem, tableName)
        break;

      default:
        break;
    }
  }
  private doVoidData(r: any, tableName: 'Device' | 'Hardware' | 'Misc') {
    switch (tableName) {
      case 'Hardware':
        const postHardware: PostHardware = {
          HardwareID: r.hardwareID,
          ReceiptID: r.receiptID,
          CustomerID: r.customerID,
          HardwareTypeID: r.hardwareTypeID || 10,
          ExpectedQty: r.expectedQty,
          RecordStatus: "U",
          Active: false,
          LoginId: this.appService.loginId
        }
        const HardwareDetails = [postHardware]
        const body = { HardwareDetails }
        this.apiService.postProcessHardware(body).subscribe({
          next: (v: any) => {
            console.log({ v });
            this.appService.successMessage(MESSAGES.DataSaved);
            this.fetchDataHardware();
          },
          error: (err) => {
            this.appService.errorMessage(MESSAGES.DataSaveError);
            console.log(err);
          }
        });
        break;

      default:
        break;
    }
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
    console.log(this.customerTypeSelected)
    console.log(this)
    if (this.customerTypeSelected?.customerTypeName == 'Vendor') {
      this.isDisabledBehalfOfCusotmer = true
    } else {
      this.isDisabledBehalfOfCusotmer = false
    }
    if (this.customerTypeSelected?.customerTypeName) {
      this.initCustomersList(this.customerTypeSelected?.customerTypeName as any)
    }
  }
  private initCustomersList(entityType: EntityType) {
    // @ts-ignore
    this.customer = this.appService.masterData.entityMap[entityType]
    // @ts-ignore
    this.customerTextField = entityType + 'Name';
    // @ts-ignore
    this.customerValueField = entityType + 'ID';
    if (entityType == 'Employee') {
      this.employees = this.appService.masterData.entityMap[entityType]
    }
  }
  onChangeHoldComments() {
    this.gridData[0].holdComments = this.gridData[0].holdComments.trim()
    if (this.gridData[0].holdComments) {
      this.gridData[0].isHold = true
    } else {
      this.gridData[0].isHold = false
    }
  }
}
