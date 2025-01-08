import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { GridDataResult, SelectableSettings } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { Customer, MESSAGES, PostShipment, ReceiptLocation, Shipment, ShipmentCategory, ShipmentDetails, ShipmentDetails2 } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-shipping-record',
  templateUrl: './shipping-record.component.html',
  styleUrls: ['./shipping-record.component.scss']
})
export class ShippingRecordComponent implements OnDestroy {
  shipmentNumber: string = ''
  shipmentLocation: string = ''
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;

  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  senderInformation: string = ''
  shipmentComments: string = ''
  shipmentCategories: ShipmentCategory[] = []
  shipmentCategorySelected: ShipmentCategory | undefined;
  isShipped = false
  customerInformation = ''

  gridDataResult: GridDataResult = { data: [], total: 0 };
  customerID: number = 0;
  isDisabled: any = {
    shipBtn: false,
    clearBtn: false
  }
  isEditMode = false;
  @Output() onClose = new EventEmitter<void>();
  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.shipmentCategories = this.appService.shipmentCategories

    if (this.appService.sharedData.shipping.isViewMode || this.appService.sharedData.shipping.isEditMode) {
      this.isEditMode = true;
      const dataItem: Shipment = this.appService.sharedData.shipping.dataItem;
      console.log({ dataItem })
      this.shipmentNumber = dataItem.shipmentNum;
      this.shipmentCategorySelected = this.shipmentCategories.find(c => c.shipmentCategoryID == dataItem.shipmentCategoryID)
      this.shipmentLocation = dataItem.shipmentLocation
      this.customerInformation = dataItem.customerInfo;
      this.senderInformation = dataItem.senderInfo
      this.shipmentComments = dataItem.shippmentInfo
      this.isShipped = dataItem.isShipped

      this.customerSelected = this.customers.find(c => c.CustomerID == dataItem.customerID);
      // this.shipmentCategorySelected = this.shipmentCategories.find(c => c.shipmentCategoryID == dataItem.shipmentTypeID);

      this.receiptLocationSelected = this.receiptLocation.find(c => c.receivingFacilityID == dataItem.currentLocationID);
      this.customerID = dataItem.customerID;
      this.fetchShipmentLineItems(dataItem.shipmentId);
     // this.fetchData();
    }
    else
    {
      
        this.customerSelected = this.customers.find(c => c.CustomerID ==this.appService.sharedData.addshipping.dataItem.customerID);
        this.customerID = this.appService.sharedData.addshipping.dataItem.customerID;
        
       // this.fetchData();
      
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
  private fetchShipmentLineItems(shipmentID: number) {
    this.apiService.getShipmentLineItems(shipmentID).subscribe({
      next: (shipmentDetails: ShipmentDetails[] | any) => {
        this.rebuildTable(shipmentDetails);
      }
    })
  }
  shipmentDetails: ShipmentDetails[] = []
  private fetchData() {
    if (!this.customerID) {
      return;
    }
    
    this.apiService.getShipmentInventories(this.customerID).subscribe({
      next: (shipmentDetails: ShipmentDetails[] | any) => {
        this.rebuildTable(shipmentDetails);
      }
    });
  }
  private rebuildTable(shipmentDetails: ShipmentDetails[] | any) {
    
    if (shipmentDetails) {
      shipmentDetails.forEach((a: ShipmentDetails) => {
        a.selected = a.shipmentLineItemID ? true : false;
        a.shipmentTypeSelected = this.appService.shipmentTypes.find(s => s.shipmentTypeID == a.shipmentTypeID)
      })
      this.gridDataResult.data = shipmentDetails;
      this.gridDataResult.total = shipmentDetails.length;
      this.shipmentDetails = shipmentDetails;
      this.gridSelectedKeys = this.shipmentDetails
      .filter(v => v.shipmentLineItemID >0) // Check for not null
      .map(d => d.inventoryID);
    
      console.log({ shipmentDetails });
    }
  }
  onChangeCustomer() {
    if (this.customerSelected) {
      this.apiService.getShipmentInventories(this.customerSelected.CustomerID).subscribe({
        next: (v: any) => {
          this.rebuildTable(v);
        }
      });
    }
  }
  selectableSettings: SelectableSettings = {
    enabled: true,
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
  autoFillTestValues() {
    this.customerSelected = this.customers[0]
    this.shipmentNumber = '123'
    this.shipmentCategorySelected = this.shipmentCategories[0]
    this.shipmentLocation = 'shipmentLocation'
    this.receiptLocationSelected = this.receiptLocation[0]
    this.senderInformation = 'senderInformation'
    this.customerInformation = 'customerInformation'
  }
  gridSelectedKeys: number[] = [];
  shipItem() {
    if (!this.gridSelectedKeys) {
      this.appService.errorMessage('Please select atleast one record');
      return;
    }
    if (this.gridSelectedKeys && this.gridSelectedKeys.length != 1) {
      this.appService.errorMessage("Please select only one record");
      return;
    }
    const sd = this.shipmentDetails.find(s => s.inventoryID == this.gridSelectedKeys[0])
    if (!sd) {
      return;
    }
    const dataItem: Shipment = this.appService.sharedData.shipping.dataItem;
    const body = { ...sd, ...dataItem }
    this.appService.isLoading = true;
    this.apiService.createShipment(body).subscribe({
      next: (res: any) => {
        this.appService.isLoading = false;
        this.appService.successMessage(MESSAGES.DataSaved);
        this.onClose.emit();
      },
      error: (e) => {
        this.appService.isLoading = false;
        const eo = e.error[0];
        let m = 'Something went wrong! Please try again';
        if (eo && eo.text) {
          m = eo.text;
        } else if (e.error.title) {
          m = e.error.title;
        }
        this.appService.errorMessage(m)
      }
    });
  }
  saveShipment() {
    if (!this.customerSelected) {
      this.appService.errorMessage('Please select customer');
      return;
    }
    const requiredFields = [
      this.shipmentNumber, this.shipmentCategorySelected, this.shipmentLocation,
      this.receiptLocationSelected, this.senderInformation, this.customerInformation,
      this.shipmentComments
    ]
    const isValid = !requiredFields.some(v => !v);
    if (!isValid) {
      this.appService.errorMessage(MESSAGES.AllFieldsRequired);
      return;
    }
    const Shipment: PostShipment[] = []
    const s: PostShipment = {
      ShipmentID: null,
      CustomerID: this.customerSelected?.CustomerID || 1,
      ShipmentNum: this.shipmentNumber,
      ShipmentCategoryID: this.shipmentCategorySelected?.shipmentCategoryID || 1,
      ShipmentLocation: this.shipmentLocation,
      CurrentLocationID: this.receiptLocationSelected?.receivingFacilityID || 1,
      SenderInfo: this.senderInformation,
      CustomerInfo: this.customerInformation,
      ShippmentInfo: this.shipmentComments.trim(),
      ShipmentDetails: this.getSelectedShipmentDetails(),
      IsShipped: this.isShipped,
      RecordStatus: "I",
      Active: true,
      LoginId: this.appService.loginId,
    }
    if (this.isEditMode) {
      const dataItem: Shipment = this.appService.sharedData.shipping.dataItem;
      s.ShipmentID = dataItem.shipmentId
      s.RecordStatus = "U";
      console.log({ dataItem })
    }

    this.apiService.postProcessShipment(s).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.onClose.emit();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
    });
  }
  private getSelectedShipmentDetails(): Array<ShipmentDetails2> {
    let selectedShipmentDetails: Array<ShipmentDetails2> = [];
    this.shipmentDetails.forEach(d => {
      if (this.gridSelectedKeys.includes(d.inventoryID)) {
        selectedShipmentDetails.push({ ShipmentLineItemID: d.shipmentLineItemID, InventoryID: d.inventoryID })
      }
    })
    return selectedShipmentDetails;
  }
  clearForm() {
    this.customerSelected = undefined;
    this.shipmentNumber = '';
    this.senderInformation = ''
    this.shipmentComments = ''
    this.shipmentCategorySelected = undefined
    this.isShipped = false;
    this.receiptLocationSelected = undefined;
    this.shipmentLocation = '';
    this.customerInformation = ''
  }
}
