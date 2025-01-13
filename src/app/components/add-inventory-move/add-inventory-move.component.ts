import { Component, EventEmitter, OnDestroy, Output,ChangeDetectorRef  } from '@angular/core';
import { ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings, SelectionEvent } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { CombineLot, CombineLotPayload, Customer, ReceiptLocation } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
@Component({
  selector: 'app-add-inventory-move',
  templateUrl: './add-inventory-move.component.html',
  styleUrls: ['./add-inventory-move.component.scss']
})
export class AddInventoryMoveComponent implements OnDestroy {
  shipmentNumber: string = ''
  shipmentLocation: string = ''
  
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  lotNumber: string | null = null;  // Lot number
  lotNumbers: string[] = [];
  inventoryID:number  = 0;
  currentLocation:string  = '';
  public searchTerm: string = '';
    allLotNumbers: string[] = []; // F
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
  subLocation: string[] = ['Rel Storage'];
  subLocationSelected: string = '';
  constructor(public appService: AppService, private apiService: ApiService,private cdr: ChangeDetectorRef ) { }

  ngOnInit(): void {

    this.getLotNumbers();
  
    if (this.appService.sharedData.Invmove.isViewMode || this.appService.sharedData.Invmove.isEditMode) {
   
      this.isEditMode = true;
      
    
      const dataItem = this.appService.sharedData.Invmove.dataItem;
      this.lotNumber=dataItem.lotNum;
      this.inventoryID=dataItem.inventoryID;
      //console.log(dataItem);
      const lotno=dataItem.lotNum;

      this.apiService.SearchInventoryMovewith_Lot(lotno).subscribe({
        next: (res: any) => {
          console.log(res);
          this.currentLocation = res.currentLocation;
          const area_FID= res.area_FacilityID;
      
          // Set the selected receipt location based on facilityID
          this.receiptLocationSelected = this.receiptLocation.find(
            (location) => location.receivingFacilityID === res.facilityID
          );
      
          const faciltyId = this.receiptLocationSelected?.receivingFacilityID;
      
          // Fetch new locations based on the selected facility
          this.apiService.SearchInventoryMovewith_Facilty(faciltyId).subscribe({
            next: (res: any) => {
              console.log(res);
      
              // Update the new locations dropdown
              this.newLocations = res || [];
      
              // Match newLocationSelected to the record in newLocations with area_FacilityID
              this.newLocationSelected = this.newLocations.find(
                (location) => location.area_FacilityId === area_FID
              )?.area_FacilityId || null;
              
      
              console.log('Selected New Location:', this.newLocationSelected);
            },
            error: (err) => {
              console.error('Error fetching new locations:', err);
            }
          });
        },
        error: (err) => {
          this.gridDataResult.data = [];
          console.error('Error fetching lot info:', err);
        }
      });
      
      


     
    }
    if (this.appService.sharedData.Invmove.isViewMode) {
      this.isDisabled.shipBtn = true;
      
    }
    if (this.appService.sharedData.Invmove.isEditMode) {
      this.isDisabled.shipBtn = false;
      
    }
  }
  ngOnDestroy(): void {
    this.appService.sharedData.Invmove.isEditMode = false
    this.appService.sharedData.Invmove.isViewMode = false
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

filterData(data: any[]): any[] {
  if (!this.searchTerm) {
    return data;
  }
  const term = this.searchTerm.toLowerCase();
  return data.filter(item =>
    Object.values(item).some(val => String(val).toLowerCase().includes(term))
  );
}
onLotNumberChange(selectedLot: string): void {

  if (selectedLot) {
    // Replace the API URL with your backend endpoint
    this.apiService.SearchInventoryMovewith_Lot(selectedLot).subscribe({
      next: (res: any) => {
        console.log(res);
        this.currentLocation = res.currentLocation;
        this.inventoryID=res.inventoryID;
      },
      error: (err) => {
        this.gridDataResult.data = []
      }
    }); 
  } else {
    this.currentLocation = ''; // Clear the current location if no lot is selected
  }
}

onReceivingFacilityChange(selectedFacilityId: any): void {

  if (selectedFacilityId) {
    this.apiService.SearchInventoryMovewith_Facilty(selectedFacilityId.receivingFacilityID).subscribe({
      next: (res: any) => {
        console.log(res);
        this.newLocations = res || [];
          this.newLocationSelected = null; // Reset the selected new location
      },
      error: (err) => {
        
      }
    }); 
   
  } else {
    this.newLocations = []; // Clear the dropdown if no facility is selected
    this.newLocationSelected = null;
  }
}

// Handle New Location selection logic if needed
onChangeNewLocations(): void {
  console.log('New Location selected:', this.newLocationSelected);
  // Additional logic for new location selection
}




saveInventorymove(): void {
  if (!this.receiptLocationSelected) {
    this.appService.errorMessage('Please select Facility');
    return;
  }

  const ivnid = this.inventoryID;
  let areaFacId: any = null; // Default to null

  if (typeof this.newLocationSelected === 'number') {
    // Case 1: newLocationSelected is a number
    areaFacId = this.newLocationSelected;
  } else if (typeof this.newLocationSelected === 'object' && this.newLocationSelected !== null) {
    // Case 2: newLocationSelected is an object with area_FacilityId property
    areaFacId = this.newLocationSelected.area_FacilityId ?? null; // Fallback to null if area_FacilityId is undefined
  } else {
    // Case 3: Invalid or missing data
    console.error('Invalid newLocationSelected value:', this.newLocationSelected);
  }

  const receivingFacID = this.receiptLocationSelected.receivingFacilityID;

  // Call the API
  this.apiService.postInventoryMovewith_Facilty(ivnid, areaFacId, receivingFacID).subscribe({
    next: (response: any) => {
      this.appService.successMessage('Inventory move saved successfully!');
      this.cancel.emit();
    },
    error: (error: any) => {
      this.appService.errorMessage('Failed to save Inventory move.');
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