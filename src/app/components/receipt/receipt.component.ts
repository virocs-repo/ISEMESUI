import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Customer, CustomerType, DeliveryMode, DeviceItem, GoodsType, HardwareItem, ICON, INIT_DEVICE_ITEM, INIT_HARDWARE_ITEM, JSON_Object, MESSAGES, ReceiptLocation } from 'src/app/services/app.interface';
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


  contactPhone = '';
  contactPerson = ''
  expectedDateTime: Date = new Date();
  format = "MM/dd/yyyy HH:mm";

  name: string = '';
  email: string = '';
  comments: string = '';
  deliveryComments: string = '';
  address: any;

  description: string = '';

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

  expectedOrNot = 'Expected'
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

  constructor(private appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.init();
  }
  ngOnDestroy(): void {
    this.appService.sharedData.receiving.isEditMode = false
    this.appService.sharedData.receiving.isViewMode = false;
  }
  private init() {
    this.customerTypes = this.appService.masterData.customerType;
    this.customer = this.appService.masterData.customer;
    this.receiptLocation = this.appService.masterData.receiptLocation;
    this.deliveryMode = this.appService.masterData.deliveryMode;
    this.goodsType = this.appService.masterData.goodsType;

    if (this.appService.sharedData.receiving.isViewMode || this.appService.sharedData.receiving.isEditMode) {
      const dataItem = this.appService.sharedData.receiving.dataItem;

      this.isFTZ = dataItem.isFTZ;
      this.isInterim = dataItem.isInterim;
      this.customerSelected = this.customer.find(c => c.customerID == dataItem.customerID);
      this.customerTypeSelected = this.customerTypes.find(c => c.customerTypeID == dataItem.customerTypeID);

      this.receiptLocationSelected = this.receiptLocation.find(c => c.receiptLocationID == dataItem.receiptLocationID);
      this.deliveryModeSelected = this.deliveryMode.find(c => c.deliveryModeID == dataItem.deliveryModeID);
      this.goodsTypeSelected = this.goodsType.find(c => c.goodsTypeID == dataItem.goodsTypeID);
      this.address = dataItem.address
      this.comments = dataItem.comments
      this.email = dataItem.email
      this.contactPhone = dataItem.contactPhone
      this.contactPerson = dataItem.contactPerson
      this.gridData[0].noOfCartons = dataItem.noOfCartons
      this.gridData[0].isHold = dataItem.isHold
      this.gridData[0].holdComments = dataItem.holdComments
      this.expectedDateTime = new Date(dataItem.expectedDateTime);
    }
    this.fetchData();
    if (this.appService.sharedData.receiving.isViewMode) {
      this.disabledAllBtns()
    }
  }
  private fetchData() {
    this.fetchDataDevice();
    this.fetchDataHardware();
  }
  private fetchDataDevice() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      this.gridDataDevice = [{ ...INIT_DEVICE_ITEM, receiptID: dataItem.receiptID }]
      return;
    }

    this.apiService.getDeviceData(dataItem.receiptID).subscribe({
      next: (v: any) => {
        this.gridDataDevice = v;
        this.gridDataDevice.splice(0, 0, { ...INIT_DEVICE_ITEM, receiptID: dataItem.receiptID });
        console.log(v);
      }
    });
  }
  private fetchDataHardware() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    if (!dataItem.receiptID) {
      // this is for new form
      this.gridDataHardware = [{ ...INIT_HARDWARE_ITEM, receiptID: dataItem.receiptID }]
      return;
    }
    this.apiService.getHardwaredata(dataItem.receiptID).subscribe({
      next: (v: any) => {
        this.gridDataHardware = v;
        this.gridDataHardware.splice(0, 0, { ...INIT_HARDWARE_ITEM, receiptID: dataItem.receiptID });
        console.log(v);
      }
    });
  }
  receipt = {
    isValid: {
      customer: true,
      deliveryMode: true,
      contactPhone: true,
      contactPerson: true,
      address: true
    }
  }
  testAddReceipt() {
    this.receiptLocationSelected = this.receiptLocation[0];
    this.customerTypeSelected = this.customerTypes[0];
    this.customerSelected = this.customer[0];
    this.deliveryModeSelected = this.deliveryMode[0];
    this.comments = 'test comments ' + (Math.floor(Math.random() * 900) + 100);
    this.contactPerson = "Contact Person Name"
    this.contactPhone = '90 000 00 ' + (Math.floor(Math.random() * 900) + 100);
    this.address = 'NY'
    this.email = 'test@gmail.com'
  }
  addReceipt() {
    let data = {
      isFTZ: this.isFTZ,
      isInterim: this.isInterim,

      customerTypeID: this.customerTypeSelected?.customerTypeID,
      customerID: this.customerSelected?.customerID,
      receiptLocationID: this.receiptLocationSelected?.receiptLocationID || 1,
      deliveryModeID: this.deliveryModeSelected?.deliveryModeID,
      expectedDateTime: this.expectedDateTime.toISOString(),
      comments: this.comments.trim(),

      contactPhone: this.contactPhone,
      contactPerson: this.contactPerson,
      email: this.email,
      // addressID: this.address, not provided yet

      noOfCartons: this.gridData[0].noOfCartons,
      isHold: this.gridData[0].isHold,
      holdComments: this.gridData[0].holdComments,
      loginId: this.appService.loginId
    }
    if (this.appService.sharedData.receiving.isEditMode) {
      // @ts-ignore
      data.recordStatus = "U";
      data = {
        ...this.appService.sharedData.receiving.dataItem,
        ...data,
      }
    } else {
      // @ts-ignore
      data.recordStatus = "I"; data.receiptID = null;
    }
    data.loginId = this.appService.loginId;
    console.log(data);
    if (!this.customerSelected) {
      this.receipt.isValid.customer = false;
      this.appService.errorMessage('Please select customer');
      return;
    } else {
      this.receipt.isValid.customer = true;
    }
    if (!this.deliveryModeSelected) {
      this.receipt.isValid.deliveryMode = false;
      this.appService.errorMessage('Please select delivery mode');
      return;
    } else {
      this.receipt.isValid.contactPhone = true;
    }
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
    if (!this.address) {
      this.receipt.isValid.address = false;
      this.appService.errorMessage('Please enter address');
      return;
    } else {
      this.receipt.isValid.address = true;
    }

    this.doPostProcessReceipt(data);
  }
  private doPostProcessReceipt(data: JSON_Object) {
    const body = {
      "receiptDetails": [
        {
          "receiptID": 0,
          "customerTypeID": 0,
          "customerID": 0,
          "behalfID": 1,
          "receiptLocationID": 0,
          "deliveryModeID": 0,
          "contactPerson": "string",
          "contactPhone": "string",
          "email": "string",
          "expectedDateTime": "2024-09-02T01:31:09.985Z",
          "addressID": 1,
          "comments": "string",
          "noOfCartons": 0,
          "isHold": true,
          "holdComments": "string",
          "isExpected": true,
          "mailStatus": "string",
          "receivingStatus": "string",
          "recordStatus": "string",
          "active": true,
          "loginId": this.appService.loginId,
          ...data
        }
      ]
    }

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
      const data = {
        ... this.gridDataDevice[this.device.rowIndex]
      }
      if (this.device.isEditMode) {
        // @ts-ignore
        data.recordStatus = "U";
      }
      if (this.device.isAddMode) {
        // @ts-ignore
        data.recordStatus = "I";
        // @ts-ignore
        data.deviceID = null
      }
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
        if (this.device.isEditMode) {
          this.device.isAddMode = true;
          this.device.isEditMode = false;
          this.device.rowIndex = 0;
        }
        console.log({ v });
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
    const data = {
      ... this.gridDataHardware[this.hardware.rowIndex],
      loginId: this.appService.loginId
    }
    if (this.hardware.isEditMode) {
      // @ts-ignore
      data.recordStatus = "U";
    }
    if (this.hardware.isAddMode) {
      // @ts-ignore
      data.recordStatus = "I";
      // @ts-ignore
      data.hardwareID = null
    }
    console.log(data);
    if (data.serialNumber && data.customer && data.expectedQty && data.hardwareType) {
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
        if (this.hardware.isEditMode) {
          this.hardware.isAddMode = true;
          this.hardware.isEditMode = false;
          this.hardware.rowIndex = 0;
        }
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }
  public selectedValues: string = "";
  public selectedReceivers: string = "";
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
  device = {
    isEditMode: false, isAddMode: true, rowIndex: 0
  }
  hardware = {
    isEditMode: false, isAddMode: true, rowIndex: 0
  }
  rowActionMenu: MenuItem[] = [
    // { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    // { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
    // { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
  ];
  rowActionMenuDevice: MenuItem[] = [
    { text: 'Receive', svgIcon: ICON.cartIcon },
    { text: 'Print', svgIcon: ICON.printIcon },
    { text: 'Hold', svgIcon: ICON.kpiStatusHoldIcon },
  ]

  doTestEditMode() {
    const isDevice = !false
    this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.gridDataHardware[3], isDevice);
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent, dataItem: any, isDevice: boolean) {
    console.log(e); console.log(dataItem);
    switch (e.item.text) {
      case 'Edit Data':
        if (isDevice) {
          this.device.isEditMode = true;
          this.device.isAddMode = false;
          this.device.rowIndex = this.gridDataDevice.findIndex(d => d.deviceID == dataItem.deviceID);
        } else {
          this.hardware.isEditMode = true;
          this.hardware.isAddMode = false;
          this.hardware.rowIndex = this.gridDataHardware.findIndex(d => d.hardwareID == dataItem.hardwareID);
        }
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
    console.log(this.customerTypeSelected)
    console.log(this)
    if (this.customerTypeSelected?.customerTypeName == 'Vendor') {
      this.isDisabledBehalfOfCusotmer = true
    } else {
      this.isDisabledBehalfOfCusotmer = false
    }
  }
}
