import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Customer, CustomerType, DeliveryMode, GoodsType, ICON, JSON_Object, ReceiptLocation } from 'src/app/services/app.interface';
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
  FTZ: boolean = false;
  IsInterim: boolean = false;

  constructor(private appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.init();
    this.fetchData();
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
    console.log(this);
    console.log(this.appService);

    if (this.appService.sharedData.receiving.isViewMode) {
      const dataItem = this.appService.sharedData.receiving.dataItem;
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
  }
  private fetchData() {
    this.apiService.getDeviceData().subscribe({
      next: (v) => {
        console.log(v);
      }
    });
    this.apiService.getHardwaredata().subscribe({
      next: (v) => {
        console.log(v);
      }
    });
  }
  addReceipt() {
    const data = {
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
    }
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
          "loginId": 0,
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

  gridDataHardware = [
    {
      serialNumber: 'REQ-00001',
      customer: 'ASAS156',
      customerID: 0,
      expectedQty: 1510,
      hardwareType: 'Testboard'
    },
    {
      serialNumber: 'REQ-00002',
      customer: 'ASAS156',
      customerID: 0,
      expectedQty: 142,
      hardwareType: 'Probe Card'
    }
  ]
  addHardware() {
    const data = {
      serialNumber: this.gridDataHardware[0].serialNumber,
      customerID: this.gridDataHardware[0].customerID,
      expectedQty: this.gridDataHardware[0].expectedQty,
      hardwareType: this.gridDataHardware[0].hardwareType,
    }
    console.log(data);

    this.doPostProcessHardware(data);
  }
  private doPostProcessHardware(data: JSON_Object) {
    const body = {
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
        console.log({ v });
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  // addDevice
  addDevice() {
    const data = {
      serialNumber: this.gridDataHardware[0].serialNumber,
      customerID: this.gridDataHardware[0].customerID,
      expectedQty: this.gridDataHardware[0].expectedQty,
      hardwareType: this.gridDataHardware[0].hardwareType,
    }
    console.log(data);

    this.doPostProcessDevice(data);
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
          "active": true
        }
      ]
    }
    this.apiService.postProcessDevice(body).subscribe({
      next: (v: any) => {
        console.log({ v });
      },
      error: (err) => {
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
  public gridData2 = [
    {
      ISELOT: 'REQ-00001',
      CustomerLotNumber: '21561651313',
      ExpectedQty: 100,
      Expedite: false,
      PartNum: 1515,
      LabelCount: 151651,
      COO: 'CA',
      DateCode: 21321,
      Hold: true,
      HoldComments: 'Count Miss'
    },
    {
      ISELOT: 'REQ-00002',
      CustomerLotNumber: '21561651313',
      ExpectedQty: 100,
      Expedite: true,
      PartNum: 1515,
      LabelCount: 151651,
      COO: 'CA',
      DateCode: 21321,
      Hold: false,
      HoldComments: 'Count Miss'
    },
    {
      ISELOT: 'REQ-00003',
      CustomerLotNumber: '21561651313',
      ExpectedQty: 100,
      Expedite: false,
      PartNum: 1515,
      LabelCount: 151651,
      COO: 'CA',
      DateCode: 21321,
      Hold: true,
      HoldComments: 'Count Miss'
    },
    {
      ISELOT: 'REQ-00004',
      CustomerLotNumber: '21561651313',
      ExpectedQty: 100,
      Expedite: true,
      PartNum: 1515,
      LabelCount: 151651,
      COO: 'CA',
      DateCode: 21321,
      Hold: false,
      HoldComments: 'Count Miss'
    }
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
}
