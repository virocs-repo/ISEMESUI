import { Component, EventEmitter, OnDestroy, Output,ChangeDetectorRef  } from '@angular/core';
import { ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings, SelectionEvent } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { CombineLot, CombineLotPayload, Customer, ReceiptLocation } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
@Component({
  selector: 'app-int-tranfer-receiving-add',
  templateUrl: './int-tranfer-receiving-add.component.html',
  styleUrls: ['./int-tranfer-receiving-add.component.scss']
})
export class IntTranferReceivingAddComponent implements OnDestroy {
  shipmentNumber: string = ''
  shipmentLocation: string = ''
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
  currentInternalTransferID: string | null = null;
  receiptLocationSelected: ReceiptLocation | undefined;
  lotNumber: string | null = null;  // Lot number
  lotNumbers: string[] = [];
  inventoryID:number  = 0;
  ReceivedQty:string  = '';
  currentLocation:string  = '';
  public searchTerm: string = '';
    allLotNumbers: string[] = []; // 
    orgallLotNumbers: any[] = [];
// Data for New Location dropdown
newLocations: any[] = [];
newLocationSelected: any;
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
  constructor(public appService: AppService, private apiService: ApiService,private cdr: ChangeDetectorRef ) { }

  ngOnInit(): void {

    this.currentInternalTransferID=null;
  
    if (this.appService.sharedData.Inttransfer.isViewMode || this.appService.sharedData.Inttransfer.isEditMode) {
   
      this.isEditMode = true;
      const dataItem = this.appService.sharedData.Inttransfer.dataItem;
      

      this.customerSelected = this.customers.find(c => c.CustomerName == dataItem.customerName);
      this.getLotNumbers(this.customerSelected?.CustomerID);
      this.ReceivedQty=dataItem.receivedQty;
      this.lotNumber=dataItem.lotNum;
      this.inventoryID=dataItem.inventoryID;
      this.currentInternalTransferID=dataItem.internalTransferId;
      //console.log(dataItem);
      const lotno=dataItem.lotNum;
    }
    if (this.appService.sharedData.Inttransfer.isViewMode) {
      this.isDisabled.shipBtn = true;
      
    }
    if (this.appService.sharedData.Inttransfer.isEditMode) {
      this.isDisabled.shipBtn = false;
      
      
    }
  }

  onChangeCustomer() {
    if (this.customerSelected)
       {
      this.getLotNumbers(this.customerSelected.CustomerID);
    }
  }

  ngOnDestroy(): void {
    this.appService.sharedData.Inttransfer.isEditMode = false
    this.appService.sharedData.Inttransfer.isViewMode = false
  }
 
 
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
  
  }
 /*  getLotNumbers(): void {
  
    this.apiService.getallLotsdata().subscribe({
      next: (v: any) => {
        this.allLotNumbers = v; // Store the full list
        this.lotNumbers = [...this.allLotNumbers]; 
      },
      error: (v: any) => { }
    });
  } */

  getLotNumbers(customerId?: number): void {
  
     
    this.allLotNumbers=[];
    this.lotNumbers=[]
    this.apiService.getallIntransferRecieveLotsdata(customerId).subscribe({
      next: (v: any) => {
        this.orgallLotNumbers=v;
        this.allLotNumbers = v.map((item: any) => item.iseLotNum);
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

filterData(data: any[]): any[] {
  if (!this.searchTerm) {
    return data;
  }
  const term = this.searchTerm.toLowerCase();
  return data.filter(item =>
    Object.values(item).some(val => String(val).toLowerCase().includes(term))
  );
}

saveInventorymove(): void {
 

  if (!this.customerSelected) {
    this.appService.errorMessage('Please select customer');
    return;
  } 
  if (!this.lotNumber) {
    this.appService.errorMessage('Please select lot');
    return;
  } 
  // Validate ReceivedQty
  if (!this.ReceivedQty || isNaN(Number(this.ReceivedQty)) || Number(this.ReceivedQty) <= 0) {
    this.appService.errorMessage('Please enter a valid received quantity');
    return;
  }

  const selectedLot = this.orgallLotNumbers.find(
    (item: any) => item.iseLotNum === this.lotNumber
  );
 
  const internalTransferID = this.isEditMode
    ? String(this.currentInternalTransferID) // Convert to string
    : null;
  const inventoryID = selectedLot ? selectedLot.inventoryID : null;
  const requestData = {
    internalTransferID:  internalTransferID,
    receivedQty: Number(this.ReceivedQty),
    userId: this.appService.loginId, // Replace with actual user ID
    active: true, // Example value
    inventoryID: inventoryID 
  };

  // Call the API
  this.apiService.saveInternalTransferReceipt(requestData).subscribe({
    next: (response: any) => {
      this.appService.successMessage('Internal transfer receiving saved successfully!');
      this.cancel.emit();

    },
    error: (error: any) => {
      this.appService.errorMessage('Failed to Internal transfer receiving');
      
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

  this.isDisabled.shipBtn =false;
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


}