import { Component } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { Customer, ReceiptLocation, ShipmentCategory, ShipmentDetails } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-shipping-record',
  templateUrl: './shipping-record.component.html',
  styleUrls: ['./shipping-record.component.scss']
})
export class ShippingRecordComponent {
  customer: Customer[] = []
  customerSelected: Customer | undefined;

  receiptLocation: ReceiptLocation[] = []
  receiptLocationSelected: ReceiptLocation | undefined;
  senderInformation: string = ''
  shippingNo: string = ''
  shipmentCategories: ShipmentCategory[] = []
  shipmentCategorySelected: ShipmentCategory | undefined;

  gridDataResult: GridDataResult = { data: [], total: 0 };
  customerID: number = 0;
  isDisabled: any = {
    shipBtn: false,
    clearBtn: false
  }
  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.customer = this.appService.masterData.customer;
    this.receiptLocation = this.appService.masterData.receiptLocation;
    this.shipmentCategories = this.appService.shipmentCategories

    if (this.appService.sharedData.shipping.isViewMode || this.appService.sharedData.shipping.isEditMode) {
      const dataItem = this.appService.sharedData.shipping.dataItem;
      console.log({ dataItem })
      this.customerSelected = this.customer.find(c => c.customerID == dataItem.customerID);
      // this.shipmentCategorySelected = this.shipmentCategories.find(c => c.shipmentCategoryID == dataItem.shipmentTypeID);

      this.receiptLocationSelected = this.receiptLocation.find(c => c.receiptLocationID == dataItem.receiptLocationID);
      this.customerID = dataItem.customerID;
      this.fetchData();
    }
    if (this.appService.sharedData.shipping.isViewMode) {
      this.isDisabled.shipBtn = true;
      this.isDisabled.clearBtn = true;
    }
  }
  private fetchData() {
    if (!this.customerID) {
      return;
    }
    this.apiService.getShipmentDetails(this.customerID).subscribe({
      next: (shipmentDetails: ShipmentDetails[] | any) => {
        this.gridDataResult.data = shipmentDetails;
        this.gridDataResult.data.forEach(v => {
          v.shipmentTypeSelected = this.appService.shipmentTypes.find(s => s.shipmentTypeID == v.shipmentTypeID);
        })
        console.log({ shipmentDetails });
      },
      error: (v: any) => { }
    });
  }
  ship() {
    if (!this.customerSelected) {
      this.appService.errorMessage('Please select customer');
      return;
    }
    this.appService.errorMessage('Work in progess');
  }
  // test data
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

  selectableSettings: any = {
    checkboxOnly: true,
    mode: 'multiple'
  }
  columnMenuSettings: any = {
    lock: false,
    stick: false,
    setColumnPosition: { expanded: true },
    autoSizeColumn: true,
    autoSizeAllColumns: true,
  }
}
