import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { GridDataResult, SelectableSettings } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { Customer, MESSAGES, PostShipment, ReceiptLocation, Shipment, ShipmentCategory, ShipmentDetails, ShipmentDetails2 } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

import { ICON } from 'src/app/services/app.interface';
@Component({
  selector: 'app-add-shipping',
  templateUrl: './add-shipping.component.html',
  styleUrls: ['./add-shipping.component.scss'],
  standalone: false
})
export class AddShippingComponent  implements OnDestroy {
  readonly ICON = ICON;
  shipmentNumber: string = ''
  shipmentLocation: string = ''
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
  dynamicData = ['Item 1', 'Item 2', 'Item 3'];
  inputValue = '';
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  lotNumber: string | null = null;  // Lot number
  lotNumbers: string[] = [];
  allLotNumbers: string[] = []; // 

  allDeviceTypes: any[] = []; // Full list of device types
  deviceTypes: any[] = []; // Filtered or displayed list of device types
  selectedDevice: any = null; // Selected device value
  receivedFrom: string = '';
addShippingData: any[] = [];
@Output() cancel = new EventEmitter<void>();


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

    this.getDeviceTypes();
    this.getLotNumbers();
    this.shipmentCategories = this.appService.shipmentCategories;
 
  }
  ngOnDestroy(): void {

  }

  onFilter(value: string): void {
    // Check if the filter input is empty
    if (value) {
        // Filter the allLotNumbers list based on the input
        this.lotNumbers = this.allLotNumbers.filter(lot =>
            lot.toLowerCase().includes(value.toLowerCase())
        );
    } else {
        // Reset to the full list when the input is cleared
        this.lotNumbers = [...this.allLotNumbers];
    }
}

getDeviceTypes(): void {
  this.apiService.getDevicesByCustomerall().subscribe({
    next: (v: any) => {
      this.allDeviceTypes = v; // Store the full list
      this.deviceTypes = [...this.allDeviceTypes]; // Clone for filtered display
    },
    error: (error: any) => {
      console.error('Error fetching device types:', error);
    }
  });
}
shipaddItem():void{
  if (!this.gridSelectedKeys) {
    this.appService.errorMessage('Please select atleast one record');
    return;
  }

  
  const sd =  this.addShippingData.find(s => s.inventoryID == this.gridSelectedKeys[0])
  this.appService.sharedData.addshipping.dataItem = sd;

  const requestData = {
    customerID: this.customerSelected?.CustomerID || null, // Handle null case
    currentLocationID: this.receiptLocationSelected?.receivingFacilityID || null, // Handle null case
    inventoryIds: this.gridSelectedKeys.join(','), // Comma-separated inventory IDs
    shipmentCategoryID: this.shipmentCategorySelected?.shipmentCategoryID || null, // Handle null case
    userID: this.appService.loginId // Replace with actual user ID
  };

  
  this.apiService.saveAddShipmentRecord(requestData).subscribe({
    next: (response: any) => {
      this.appService.successMessage('created successfully!');
      this.cancel.emit(); // Emit the cancel event if necessary
    },
    error: (error: any) => {
      this.appService.errorMessage('Failed to create shipment record.');
      console.error('API error:', error);
    },
  });
 
  //this.cancelRequest();
  //this.openDialog();
}
// Event handler for selection change
onDeviceSelectionChange(value: any): void {
  console.log('Selected Device:', value);
  this.selectedDevice = value;
}
  getLotNumbers(): void {
    
    this.apiService.getallLotsdata().subscribe({
      next: (v: any) => {
        this.allLotNumbers = v; // Store the full list
        this.lotNumbers = [...this.allLotNumbers]; 
      },
      error: (v: any) => { }
    });
  }

  onSearch(): void {

   
    const receivedFromId = this.receiptLocationSelected?.receivingFacilityID ||null;
    const deviceId = this.selectedDevice ? this.selectedDevice.deviceTypeID : null; // Fallback to 'All' if undefined
    const lotNumber = this.lotNumber || null;  // Fallback to 'null' if not set
    const locationId =  null;
    const shipCategoryID=this.shipmentCategorySelected?.shipmentCategoryID ||null;
    const custId=this.customerSelected?.CustomerID ||null;
    this.gridDataResult.data = [];
  
    if (!receivedFromId || !this.customerSelected || !this.shipmentCategorySelected) {
      this.appService.errorMessage('Please select customer  and Location and shipment category.');
      return;
    }
    if (!receivedFromId && !deviceId && !lotNumber && !this.customerSelected) {
      this.appService.errorMessage('Please select at least one customer ,Location, Device, or Lot Number.');
      return;
    }

    this.apiService.getAddShippingInventory(custId,deviceId, locationId, receivedFromId,lotNumber,shipCategoryID).subscribe({
      next: (res: any) => {
        console.log(res);
        this.gridDataResult.data = res;
        this.addShippingData=res;
      },
      error: (err) => {
        this.gridDataResult.data = []
      }
    });
  }

  onChangeCustomer() {
  }

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
   
  }
  cancelRequest(): void {
    this.cancel.emit();  // Emit the cancel event when Cancel button is clicked
  }

  shipmentDetails: ShipmentDetails[] = []


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
  
  gridSelectedKeys: number[] = [];
 /*  shipItem() {
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
  } */
 /*  saveShipment() {
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
  } */
}

