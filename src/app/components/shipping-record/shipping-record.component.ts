import { Component, OnDestroy } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { Customer, MESSAGES, PostShipment, ReceiptLocation, Shipment, ShipmentCategory, ShipmentDetails } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-shipping-record',
  templateUrl: './shipping-record.component.html',
  styleUrls: ['./shipping-record.component.scss']
})
export class ShippingRecordComponent implements OnDestroy {
  shipmentNumber: string = ''
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;

  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  senderInformation: string = ''
  shipmentCategories: ShipmentCategory[] = []
  shipmentCategorySelected: ShipmentCategory | undefined;
  isShipped = false
  customerInformation = ''
  shipmentDetails = ''

  gridDataResult: GridDataResult = { data: [], total: 0 };
  customerID: number = 0;
  isDisabled: any = {
    shipBtn: false,
    clearBtn: false
  }
  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.shipmentCategories = this.appService.shipmentCategories

    if (this.appService.sharedData.shipping.isViewMode || this.appService.sharedData.shipping.isEditMode) {
      const dataItem: Shipment = this.appService.sharedData.shipping.dataItem;
      console.log({ dataItem })
      this.customerInformation = dataItem.customerInfo;
      this.senderInformation = dataItem.senderInfo

      this.customerSelected = this.customers.find(c => c.CustomerID == dataItem.customerID);
      // this.shipmentCategorySelected = this.shipmentCategories.find(c => c.shipmentCategoryID == dataItem.shipmentTypeID);

      this.receiptLocationSelected = this.receiptLocation.find(c => c.receivingFacilityID == dataItem.currentLocationID);
      this.customerID = dataItem.customerID;
      this.fetchData();
    }
    if (this.appService.sharedData.shipping.isViewMode) {
      this.isDisabled.shipBtn = true;
      this.isDisabled.clearBtn = true;
    }
  }
  ngOnDestroy(): void {
    this.appService.sharedData.shipping.isEditMode = false
    this.appService.sharedData.shipping.isViewMode = false
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
  saveShipment() {

    if (!this.customerSelected) {
      this.appService.errorMessage('Please select customer');
      return;
    }
    const Shipment: PostShipment[] = []
    const s: PostShipment = {
      ShipmentId: 1,
      CustomerId: this.customerSelected?.CustomerID || 1,
      ShipmentNum: this.shipmentNumber,
      ShipmentCategoryId: this.shipmentCategorySelected?.shipmentCategoryID || 1,
      ShipmentLocation: '',
      CurrentLocationId: this.receiptLocationSelected?.receivingFacilityID || 1,
      SenderInfo: this.senderInformation,
      CustomerInfo: this.customerInformation,
      ShipmentDetails: this.shipmentDetails,
      RecordStatus: "I",
      IsActive: true,
      LoginId: this.appService.loginId,
    }

    this.apiService.postProcessShipment(s).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        // this.fetchDataDevice();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
    });
  }
}
