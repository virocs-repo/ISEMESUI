import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings, SelectionEvent } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { Customer, ICON, MESSAGES, PostShipment, ReceiptLocation, Shipment, ShipmentCategory, ShipmentDetails, ShipmentDetails2 } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-add-combined-lot',
  templateUrl: './add-combined-lot.component.html',
  styleUrls: ['./add-combined-lot.component.scss']
})
export class AddCombinedLotComponent implements OnDestroy {
  shipmentNumber: string = ''
  shipmentLocation: string = ''
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
  lotNumber: string | null = null;  // Lot number
  lotNumbers: string[] = [];

    allLotNumbers: string[] = []; // F
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  senderInformation: string = ''
  shipmentCategories: ShipmentCategory[] = []
  shipmentCategorySelected: ShipmentCategory | undefined;
  isShipped = false
  customerInformation = ''

  gridDataResult: GridDataResult = { data: [], total: 0 };
  public pageSize = 3;
  public skip = 0;
  customerID: number = 0;
  ComboComments:string='';
  comboLotName:string='';
  isDisabled: any = {
    shipBtn: false,
    clearBtn: false
  }
  isEditMode = false;
  dropdownData: any[] = []; // Data for the dropdown
  selectedDropdownValue: any; // Selected value in the dropdown
  gridSelectedKeys: any[] = []; // Tracks selected rows in the grid
  @Output() cancel = new EventEmitter<void>();
  isPrimaryLotValid: boolean = true; // Assume valid by default
  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {

    this.getLotNumbers();
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

      this.customerSelected = this.customers.find(c => c.CustomerID == dataItem.customerID);
      // this.shipmentCategorySelected = this.shipmentCategories.find(c => c.shipmentCategoryID == dataItem.shipmentTypeID);

      this.receiptLocationSelected = this.receiptLocation.find(c => c.receivingFacilityID == dataItem.currentLocationID);
      this.customerID = dataItem.customerID;
      //this.fetchShipmentLineItems(dataItem.shipmentId);
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
  private fetchShipmentLineItems(shipmentID: number) {
    this.apiService.getShipmentLineItems(shipmentID).subscribe({
      next: (shipmentDetails: ShipmentDetails[] | any) => {
        this.rebuildTable(shipmentDetails);
      }
    })
  }
  shipmentDetails: ShipmentDetails[] = []
  shipmentDetailsTxt = ''
  private fetchData() {
    if (!this.customerID) {
      return;
    }
   /*  this.apiService.getShipmentDetails(this.customerID).subscribe({
      next: (shipmentDetails: ShipmentDetails[] | any) => {
        this.rebuildTable(shipmentDetails);
      }
    }); */
  }
  private rebuildTable(shipmentDetails: ShipmentDetails[] | any) {
    if (shipmentDetails) {
      shipmentDetails.forEach((a: ShipmentDetails) => {
        a.shipmentTypeSelected = this.appService.shipmentTypes.find(s => s.shipmentTypeID == a.shipmentTypeID)
        a.selected = true;
      })
      this.gridDataResult.data = shipmentDetails;
      this.gridDataResult.total = shipmentDetails.length;
      this.shipmentDetails = shipmentDetails;
      this.gridSelectedKeys = this.shipmentDetails.map(d => d.inventoryID);
      console.log({ shipmentDetails });
    }
  }
  onChangeCustomer() {
    if (this.customerSelected) {
     /*  this.apiService.getShipmentInventories(this.customerSelected.CustomerID).subscribe({
        next: (v: any) => {
          
        }
      }); */
    }
  }
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
  
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
  cancelRequest(): void {
    this.cancel.emit();  // Emit the cancel event when Cancel button is clicked
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

onSearch(): void {
  const customerId = this.customerSelected?.CustomerID || null;
  const lotNumber = this.lotNumber || 'null';  // Fallback to 'null' if not set
  this.gridDataResult.data = [];

  this.apiService.SearchComblotsWithCust_Lot(customerId, lotNumber).subscribe({
    next: (res: any) => {
      console.log(res);
      this.gridDataResult.data = res;
    },
    error: (err) => {
      this.gridDataResult.data = []
    }
  }); 
}
saveCombineLots(): void {
  if (!this.selectedDropdownValue) {
    this.isPrimaryLotValid = false;
    this.appService.errorMessage('Please select a primary lot.');
    return;
  } else {
    this.isPrimaryLotValid = true;
  }

  if (!this.comboLotName || this.dropdownData.length === 0) {
    this.appService.errorMessage('Please fill all required fields.');
    return;
  }

  // Create the JSON payload
  const payload = {
    comboLotID: null, // Assuming it's 0 for a new combo
    comboName: this.comboLotName,
    str_InventoryId: this.dropdownData.map((item) => item.inventoryID).join(','), // Convert inventory IDs to a comma-separated string
    primary_InventoryId: this.selectedDropdownValue.inventoryID, // The selected primary inventory ID
    userID: this.appService.loginId, // Replace with actual logged-in user ID
    active: true,
    comments: this.ComboComments,
  };

  console.log('Payload:', payload);

  // Call the API
  this.apiService.postCombineLots(payload).subscribe({
    next: (response: any) => {
      this.appService.successMessage('Combine Lots saved successfully!');
      this.cancel.emit();

    },
    error: (error: any) => {
      this.appService.errorMessage('Failed to save Combine Lots.');
      
    },
  });
}

onSelectionChange(event: SelectionEvent): void {
  console.log('Grid Selected Keys:', this.gridSelectedKeys);

  const selectedRows = this.gridDataResult.data.filter((item) =>
    this.gridSelectedKeys.includes(item.inventoryID)
  );

  this.dropdownData = selectedRows.map((row: any) => ({
    iseLotNum: row.iseLotNum,
    inventoryID: row.inventoryID,
  }));

  console.log('Updated Dropdown Data:', this.dropdownData);
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
 
  saveShipment() {
    if (!this.customerSelected) {
      this.appService.errorMessage('Please select customer');
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
        // this.fetchDataDevice();
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
}