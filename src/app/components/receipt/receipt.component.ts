import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent {
  isHoldCheckboxEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == 'HoldCheckbox')?.active ?? false;
  isHoldCommentEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Add")?.
    featureField?.find(o => o.featureFieldName == "HoldComments")?.active ?? false;



  expectedOrNot = 'Expected'
  FTZ: boolean = false;
  IsInterim: boolean = false;
  public name: string = '';
  public email: string = '';
  public description: string = '';
  public comment: string = '';

  constructor(private appService: AppService) { }

  ngOnInit(): void {
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
  phone = ''
  public gridData: any[] = [
    {
      ProductID: 1,
      comments: "Chai",
      NoOfCartons: 18,
      isHold: false,
      isHoldCheckboxEnabled: !this.isHoldCheckboxEnabled,
      isHoldCommentEnabled: !this.isHoldCommentEnabled
    },
    // {
    //   ProductID: 2,
    //   comments: "Chang",
    //   NoOfCartons: 19,
    //   isHold: false,
    // },
    // {
    //   ProductID: 3,
    //   comments: "Aniseed Syrup",
    //   NoOfCartons: 10,
    //   isHold: true,
    // },
  ];
  public gridStyle = {
    backgroundColor: 'green'
  };
  public expectedDateTime: Date = new Date();
  public format = "MM/dd/yyyy HH:mm";
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
