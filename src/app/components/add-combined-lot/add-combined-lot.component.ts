import { Component, EventEmitter, OnDestroy, Output,ChangeDetectorRef  } from '@angular/core';
import { ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings, SelectionEvent } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { CombineLot, CombineLotPayload, Customer, ICON, MESSAGES, PostShipment, ReceiptLocation, Shipment, ShipmentCategory, ShipmentDetails, ShipmentDetails2 } from 'src/app/services/app.interface';
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

    this.getLotNumbers();
  
    if (this.appService.sharedData.combolot.isViewMode || this.appService.sharedData.combolot.isEditMode) {
   
      this.isEditMode = true;
      const dataItem: CombineLot = this.appService.sharedData.combolot.dataItem;
      this.customerSelected = this.customers.find(c => c.CustomerID == dataItem.customerVendorID);
      console.log (dataItem.comboLotID )
   
      this.apiService.getViewEditComblotsWithId(dataItem.comboLotID).subscribe({
        next: (res: any[]) => {
          console.log(res);
          // Find all records that match the comboLotID
          const allresdata = res.filter((s: { comboLotID: number }) => s.comboLotID === dataItem.comboLotID);
      
          if (this.appService.sharedData.combolot.isViewMode)
        {
            if (allresdata.length > 0)
           {
              // Assign the matching records to the grid
              this.gridDataResult.data = allresdata;
      
              // Automatically select rows where viewFlag = 1
              this.gridSelectedKeys = allresdata
                .filter(item => item.viewFlag === 1) // Filter items with viewFlag = 1
                .map(item => item.inventoryID); // Map to the unique key field (inventoryID)
                 // Populate dropdown data
          this.dropdownData = allresdata.map((row: any) => ({
          iseLotNum: row.iseLotNum,
          inventoryID: row.inventoryID,
        }));
        // Automatically select the primary lot in the dropdown
        const primaryLot = allresdata.find((row: any) => row.isPrimaryAddress === true);
        if (primaryLot) {
          this.selectedDropdownValue = primaryLot.inventoryID; // Select the primary lot by inventoryID
        } else {
          this.selectedDropdownValue = null; // Reset if no primary lot is found
        }
    


         // Pre-fill comboName and ComboComments
         this.comboLotName = allresdata[0].comboName || '';
         this.ComboComments = allresdata[0].comments || '';
         this.cdr.detectChanges();
                
            } 
            else
            {
              console.warn('No data found for the specified comboLotID.');
              this.gridDataResult.data = [];
              this.gridSelectedKeys = [];
            }
          } 
          
          else
           {
            // If not in view mode, use the full result set
            this.gridDataResult.data = res;
      
            // Automatically select rows where viewFlag = 1
            this.gridSelectedKeys = res
              .filter(item => item.viewFlag === 1)
              .map(item => item.inventoryID);


            // Populate dropdown data
      

            this.dropdownData = allresdata.map((row: any) => ({
              iseLotNum: row.iseLotNum,
              inventoryID: row.inventoryID,
            }));
      // Automatically select the primary lot in the dropdown
      const primaryLot = allresdata.find((row: any) => row.isPrimaryAddress === true);
      if (primaryLot) {
        this.selectedDropdownValue = primaryLot.inventoryID; // Select the primary lot by inventoryID
      } else {
        this.selectedDropdownValue = null; // Reset if no primary lot is found
      }

      // Pre-fill comboName and ComboComments
      this.comboLotName = res[0]?.comboName || '';
      this.ComboComments = res[0]?.comments || '';  
      this.cdr.detectChanges();
          }
          
          console.log('Selected Keys:', this.gridSelectedKeys);
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.gridDataResult.data = [];
          this.gridSelectedKeys = [];
        }
      });
      
    }
    if (this.appService.sharedData.combolot.isViewMode) {
      this.isDisabled.shipBtn = true;
      this.isDisabled.clearBtn = true;
    }
  }
  ngOnDestroy(): void {
    this.appService.sharedData.combolot.isEditMode = false
    this.appService.sharedData.combolot.isViewMode = false
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
  const payload: CombineLotPayload = {
    comboLotID: null, // Assuming it's 0 for a new combo
    comboName: this.comboLotName,
    str_InventoryId: this.dropdownData.map((item) => item.inventoryID).join(','), // Convert inventory IDs to a comma-separated string
    primary_InventoryId: this.selectedDropdownValue.inventoryID, // The selected primary inventory ID
    userID: this.appService.loginId, // Replace with actual logged-in user ID
    active: true,
    comments: this.ComboComments,
  };

  if (this.isEditMode) {
    const dataItem: CombineLot = this.appService.sharedData.combolot.dataItem;
    payload.comboLotID=dataItem.comboLotID;
    payload.primary_InventoryId=this.selectedDropdownValue;

  }
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


}