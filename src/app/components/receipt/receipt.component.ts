import { Component, OnDestroy, OnInit } from '@angular/core';
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
  address: any;

  description: string = '';

  isHoldCheckboxEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == 'HoldCheckbox')?.active ?? false;
  isHoldCommentEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == "HoldComments")?.active ?? false;

  gridData = [
    {
      noOfCartons: 18,
      isHold: false,
      holdComments: "Chai",
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
      this.fetchData();
    }
    if (this.appService.sharedData.receiving.isViewMode) {
      this.disabledAllBtns()
    }
  }
  private fetchData() {
    const dataItem = this.appService.sharedData.receiving.dataItem;
    this.apiService.getDeviceData(dataItem.receiptID).subscribe({
      next: (v: any) => {
        console.log(v);
        this.gridDataDevice = v;
        this.gridDataDevice.splice(0, 0, INIT_DEVICE_ITEM);
      }
    });
    this.apiService.getHardwaredata(dataItem.receiptID).subscribe({
      next: (v: any) => {
        console.log(v);
        this.gridDataHardware = v;
        this.gridDataHardware.splice(0, 0, INIT_HARDWARE_ITEM);
      }
    });
  }
  addReceipt() {
    let data = {
      customerTypeID: this.customerTypeSelected?.customerTypeID,
      customerID: this.customerSelected?.customerID,
      receiptLocationID: this.receiptLocationSelected?.receiptLocationID,
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
      recordStatus: "I",
      loginId: this.appService.loginId
    }
    if (this.appService.sharedData.receiving.isEditMode) {
      data.recordStatus = "U"
      data = {
        ...this.appService.sharedData.receiving.dataItem,
        ...data,
      }
    }
    data.loginId = this.appService.loginId
    console.log(data);

    this.doPostProcessReceipt(data);
  }
  private doPostProcessReceipt(data: JSON_Object) {
    const body = {
      "receiptDetails": [
        {
          "receiptID": 0,
          "customerTypeID": 0,
          "customerID": 0,
          "behalfID": 0,
          "receiptLocationID": 0,
          "deliveryModeID": 0,
          "contactPerson": "string",
          "contactPhone": "string",
          "email": "string",
          "expectedDateTime": "2024-09-02T01:31:09.985Z",
          "addressID": 0,
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
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  gridDataHardware: HardwareItem[] = [
    // {
    //   "hardwareID": 1,
    //   "receiptID": 1,
    //   "inventoryID": 1,
    //   "hardwareType": "CPU",
    //   "customerID": 1,
    //   "customer": "Amazon",
    //   "serialNumber": "SN00001",
    //   "expectedQty": 1,
    //   "createdOn": "2024-08-28T03:20:22.767",
    //   "modifiedOn": "2024-08-28T03:20:22.767",
    //   "active": true
    // }
  ]
  addHardware() {
    const data = {
      ... this.gridDataHardware[0],
      recordStatus: "I",
      loginId: this.appService.loginId,
      hardwareID: null
    }
    console.log(data);

    this.doPostProcessHardware(data);
  }
  private doPostProcessHardware(data: JSON_Object) {
    const body :any= {
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
    // delete body.hardwareDetails[0].createdOn;
    // delete body.hardwareDetails[0].modifiedOn;
    if (body.hardwareDetails && body.hardwareDetails[0]) {
      delete body.hardwareDetails[0].createdOn;
      delete body.hardwareDetails[0].modifiedOn;
    }
    this.apiService.postProcessHardware(body).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        console.log({ v });
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }
  // addDevice
  public gridDataDevice: DeviceItem[] = [
    // {
    //   ISELOT: 'REQ-00001',
    //   CustomerLotNumber: '21561651313',
    //   ExpectedQty: 100,
    //   Expedite: false,
    //   PartNum: 1515,
    //   LabelCount: 151651,
    //   COO: 'CA',
    //   DateCode: 21321,
    //   Hold: true,
    //   HoldComments: 'Count Miss'
    // }
  ];
  addDevice() {
    if (this.gridDataDevice && this.gridDataDevice.length) {
      const data = {
        ... this.gridDataDevice[0]
      }
      console.log(data);

      this.doPostProcessDevice(data);
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
        console.log({ v });
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });
  }
  public selectedValues: string = "";
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
  public items: any[] = [
    { text: 'Item1', icon: 'edit' },
    { text: 'Item2', icon: 'delete' },
    { text: 'Item3', icon: 'copy' }
  ];

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
}
