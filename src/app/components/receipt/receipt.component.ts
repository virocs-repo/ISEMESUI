import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Customer, CustomerType, DeliveryMode, GoodsType, ICON, JSON_Object, ReceiptLocation } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent implements OnInit {
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
  contactPerson =''
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
    this.customerTypes = this.appService.masterData.customerType;
    this.receiptLocation = this.appService.masterData.receiptLocation;
    this.goodsType = this.appService.masterData.goodsType;
    this.deliveryMode = this.appService.masterData.deliveryMode;
    this.customer = this.appService.masterData.customer;
    this.init();
  }
  private init() {
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
  gridData3 = [
    {
      serial: 'REQ-00001',
      CustomerId: 'ASAS156',
      ExpectedQty: 1510,
      HardwareType: 'Testboard'
    },
    {
      serial: 'REQ-00002',
      CustomerId: 'ASAS156',
      ExpectedQty: 142,
      HardwareType: 'Probe Card'
    }
  ]

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }
}
