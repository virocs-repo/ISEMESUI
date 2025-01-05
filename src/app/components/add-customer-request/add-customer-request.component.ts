import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { CustomerService } from '../../services/customer.service';  // Adjust the path as necessary
import { CellClickEvent, GridComponent, GridDataResult,RowArgs  } from '@progress/kendo-angular-grid';
import { CustomerOrder, OrderRequest } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ICON, MESSAGES, Customer } from 'src/app/services/app.interface';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-customer-request',
  templateUrl: './add-customer-request.component.html',
  styleUrls: ['./add-customer-request.component.scss']
})
export class AddCustomerRequestComponent implements OnInit {
  @Input() isEditMode: boolean = true;  // Use this flag to control view/edit mode
  @Input() addCustomerMode: boolean = false;  // Use this flag to control view/edit mode
  @Output() customerAdded = new EventEmitter<void>();
  @Input() customerOrd: any;  // Receive the customer order data
  @Input() formOrdData:any;
  @ViewChild('grid', { static: true }) grid!: GridComponent; 
  gridDataResult: GridDataResult = { data: [], total: 0 };
  customer: Customer[] = []
  customerSelected: Customer | undefined;
  deviceTypes: string[] = ['Device', 'Hardware','Miscellaneous Goods','All'];  // Array to hold device types
  customerOrderTypes: string[] = ['Finished Goods', 'WIP', 'Scrap']; 
  customerOrderTypeSelected:string='Finished Goods';
  deviceTypeSelected: string = 'All';  // Variable to hold the selected device type
  lotNumber: string | null = null;  // Lot number
  lotNumbers: string[] = [];

    allLotNumbers: string[] = []; // F
  // below code can be changed/removed
  selectedRows: any[] = []; 
  selectedcheckBoxs: Set<number> = new Set<number>();
  public columns: any[] = [];  // Array to hold column configurations
  // Create an EventEmitter to emit the cancel event to the parent
  @Output() cancel = new EventEmitter<void>();
 
  //public selectedRecords: any[] = []; // Array to track selected records
  public selectableSettings = { checkboxOnly: true, mode: 'multiple' };
  public selectedRecords: Set<any> = new Set<any>(); // Use Set to track unique selected records
  public formData : any = {}; 


  
  constructor(private customerService: CustomerService, public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.formData.OQA = false;   // Initialize OQA as false
    this.formData.Bake = false;  // Initialize Bake as false
    this.formData.PandL = false; // Initialize P&L as false
    this.formData.CustomerId=null;
    this.customer = this.appService.masterData.entityMap.Customer;
    this.formData.customerOrderTypeSelected=this.customerOrderTypeSelected;

    console.log('Component initialized or reloaded');
    this.initializeColumns();
    if (!this.addCustomerMode && this.customerOrd && this.customerOrd.length > 0) {
      // Execute logic if `customerOrd` array has elements
      this.gridDataResult.data = this.customerOrd;
    
     
      this.formData=this.formOrdData;
      this.initializeSelectedRows();

    }

    this.getLotNumbers();
   
  }
  

  initializeSelectedRows(): void {
    // Loop through grid data and determine which rows to select based on your condition
    this.gridDataResult.data.forEach((dataItem, index) => {

      if (!this.addCustomerMode && Number(dataItem.customerOrderDetailID) > 0) // Positive number
       {
        

        const selectedRecord = {
          CustomerOrderDetailID: dataItem.customerOrderDetailID,
          InventoryID: dataItem.inventoryID,
          ShippedQty: Number(dataItem.shippedQty),
          RecordStatus: 'U' // Assuming existing records are set to 'U'
        };

        // Add the record to the selectedRecords set
        this.selectedRecords.add(selectedRecord);


        this.selectedcheckBoxs.add(dataItem.inventoryID);
        // Ensure `this.grid` is a reference to the Kendo Grid component
       }
    });

    console.log( this.selectedRows);
 

    
  }

  isRowSelected = (rowArgs: RowArgs): boolean => {
    // Return true if the row's unique key is in the selectedRecords Set
    return this.selectedcheckBoxs.has(rowArgs.dataItem.inventoryID);
  };
  
  /* onSelectionChange(event: any): void {

  
    (event.selectedRows || []).forEach((row: { dataItem: any }) => this.selectedRecords.add({
      CustomerOrderDetailID: null, // Assuming new records
      InventoryID: row.dataItem.inventoryID,
      ShippedQty: Number(row.dataItem.shippedQty),
      RecordStatus: 'I'
    }));

    (event.deselectedRows || []).forEach((row: { dataItem: any }) => this.selectedRecords.delete({
      CustomerOrderDetailID: null,
      InventoryID: row.dataItem.inventoryID,
      ShippedQty: Number(row.dataItem.shippedQty),
      RecordStatus: 'I'
    }));
  
  
  } */
    onSelectionChange(event: any): void {
      // Loop through the selected rows and add them to the selectedRecords set
      (event.selectedRows || []).forEach((row: { dataItem: any }) => {
        // If CustomerOrderDetailID is null or undefined, set it to null; otherwise, keep the original value
        let customerOrderDetailID = row.dataItem.customerOrderDetailID ?? null;
    
        // Set RecordStatus based on whether CustomerOrderDetailID is null or not
        const recordStatus = customerOrderDetailID !== null ? 'U' : 'I';
    
        // Create a selected record object with the modified CustomerOrderDetailID
        const selectedRecord = {
          CustomerOrderDetailID: customerOrderDetailID, // Use the modified CustomerOrderDetailID
          InventoryID: row.dataItem.inventoryID,
          ShippedQty: Number(row.dataItem.shippedQty),
          RecordStatus: recordStatus
        };
    
        this.selectedRecords.add(selectedRecord); // Add the selected record to the set
        this.selectedcheckBoxs.add(row.dataItem.inventoryID);
      });
    
      // Loop through the deselected rows and remove them from the selectedRecords set
      (event.deselectedRows || []).forEach((row: { dataItem: any }) => {
        // If CustomerOrderDetailID is null or undefined, set it to null; otherwise, keep the original value
        let customerOrderDetailID = row.dataItem.customerOrderDetailID ?? null;
        const uniqueKey = row.dataItem.inventoryID || customerOrderDetailID;


      // If the deselected row has a valid CustomerOrderDetailID, mark it for deletion ('D') instead of removing it
    if (customerOrderDetailID !== null) {
      // Find the record in the selectedRecords set and update its status to 'D'
      this.selectedRecords.forEach(record => {
        if (record.CustomerOrderDetailID === customerOrderDetailID && record.InventoryID === row.dataItem.inventoryID) {
          record.RecordStatus = 'D'; // Update the status to 'D'
        }
      });
    } else {
      // If the record does not have a CustomerOrderDetailID, remove it from the selectedRecords set
      this.selectedRecords.forEach(record => {
        if (record.InventoryID === row.dataItem.inventoryID) {
          this.selectedRecords.delete(record);
        }
      });
    }

    this.selectedcheckBoxs.delete(row.dataItem.inventoryID);
      });
    
      console.log('Updated Selected Records:', Array.from(this.selectedRecords)); // Optional: Log selected records for debugging
    }
    

  initializeColumns(): void {
    this.columns = [
      /*  { field: 'receiptID', title: 'Receipt ID', width: 100 },
       { field: 'inventoryID', title: 'Inventory ID', width: 100 },
       { field: 'hardwareType', title: 'Hardware Type', width: 150, template: (dataItem: any) => dataItem.hardwareType || 'N/A' }, */
      { field: 'iseLotNum', title: 'ISE Lot Number', width: 80 },
      { field: 'inventoryID', title: 'Inventory ID', width: 100 },
      { field: 'customerLotNum', title: 'Customer Lot Number', width: 80 },
      { field: 'expectedQty', title: 'Expected Quantity', width: 60 },
      { field: 'expedite', title: 'Expedite', width: 60, template: (dataItem: any) => dataItem.expedite ? 'Yes' : 'No' },
      { field: 'partNum', title: 'Part Number', width: 80 },
      { field: 'labelCount', title: 'Label Count', width: 60 },
      // { field: 'coo', title: 'Country of Origin (COO)', width: 100 },
      { field: 'dateCode', title: 'Date Code', width: 80 },
      { field: 'shippedQty', title: 'Shipped Quantity', width: 60, editable: true },
      // { field: 'isHold', title: 'Is Hold', width: 80, template: (dataItem: any) => dataItem.isHold ? 'Yes' : 'No' },
      { field: 'holdComments', title: 'Hold Comments', width: 100, template: (dataItem: any) => dataItem.holdComments || 'N/A' },
     
      // { field: 'createdOn', title: 'Created On', width: 150, template: (dataItem: any) => new Date(dataItem.createdOn).toLocaleString() },
      // { field: 'modifiedOn', title: 'Modified On', width: 150, template: (dataItem: any) => new Date(dataItem.modifiedOn).toLocaleString() },
      // { field: 'active', title: 'Active', width: 80, template: (dataItem: any) => dataItem.active ? 'Yes' : 'No' }
    ];
  }

  cancelRequest(): void {
    this.cancel.emit();  // Emit the cancel event when Cancel button is clicked
  }

  // Function to load data from the API based on selected filters
  onSearch(): void {

    if (!this.customerSelected) {
      
      this.appService.errorMessage('Please select a customer');
      return;
    } 
    const customerId = this.customerSelected?.CustomerID || null;
    const goodsType = this.deviceTypeSelected || 'All';  // Fallback to 'All' if undefined
    const lotNumber = this.lotNumber || 'null';  // Fallback to 'null' if not set
    const customerordType=this.customerOrderTypeSelected;
    this.gridDataResult.data = [];
    this.customerOrd=[];
    this.apiService.getInventory(customerId, goodsType, lotNumber,customerordType).subscribe({
      next: (res: any) => {
        console.log(res);
        this.gridDataResult.data = res;
      },
      error: (err) => {
        this.gridDataResult.data = []
      }
    });
  }



  editHandler({ sender, rowIndex, columnIndex, dataItem }: CellClickEvent): void {

    if (!this.isEditMode) return; // Disable cell edits in view mode
    // Adjust columnIndex by subtracting 1 to account for the checkbox column
    const adjustedColumnIndex = columnIndex - 1;

    if (adjustedColumnIndex >= 0) {
      const clickedColumn = this.columns[adjustedColumnIndex]?.field;

      // Restrict editing to the 'shippedQty' column only
      if (clickedColumn === 'shippedQty') {
        sender.editCell(rowIndex, sender.columns.toArray()[columnIndex], dataItem);
      

      } else {
        sender.closeCell();  // Close the cell without any arguments
      }
    } else {
      sender.closeCell();  // Close the cell if the checkbox column is clicked
    }

   
  }

  cellCloseHandler({ sender, dataItem, column }: any): void {
    // Check if the column being edited is 'shippedQty'
    if (column.field === 'shippedQty') {

      // The new value is already bound to the dataItem via ngModel
      console.log('Updated shippedQty:', dataItem.shippedQty);  // This should log the new value
    }

    // You can manually update the selected records here if needed
  this.selectedRecords.forEach((selectedRecord) => {
    if (selectedRecord.InventoryID === dataItem.inventoryID) {
      selectedRecord.ShippedQty = Number(dataItem.shippedQty);  // Update the ShippedQty in selectedRecords
    }
  });

    // Close the cell after the edit
    sender.closeCell();
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
  getLotNumbers(): void {
    
    this.apiService.getallLotsdata().subscribe({
      next: (v: any) => {
        this.allLotNumbers = v; // Store the full list
        this.lotNumbers = [...this.allLotNumbers]; 
      },
      error: (v: any) => { }
    });
  }

  submitForm(): void {

   
    if ( this.selectedRecords.size <=0) {
      
      this.appService.errorMessage('Please select atleast one row ');
      return;
    } 


    if (!this.formData.CompanyName) {
      
      this.appService.errorMessage('Please add companyName');
      return;
    } 

    if (!this.formData.ContactPerson) {
      
      this.appService.errorMessage('Please add contactName');
      return;
    } 
    if (!this.formData.ContactPhone) {
      
      this.appService.errorMessage('Please add phoneNumber');
      return;
    } 
    if (!this.formData.Address1) {
      
      this.appService.errorMessage('Please add addressLine1');
      return;
    } 
    if (!this.formData.City) {
      
      this.appService.errorMessage('Please add city');
      return;
    } 
    if (!this.formData.State) {
      
      this.appService.errorMessage('Please add state');
      return;
    } 
    if (!this.formData.Zip) {
      
      this.appService.errorMessage('Please add zip');
      return;
    } 
    if (!this.formData.Country) {
      
      this.appService.errorMessage('Please add country');
      return;
    } 
    const customerOrderID = (this.customerOrd && this.customerOrd.length > 0) 
    ? (this.customerOrd.find((order: any) => order.customerOrderID !== null && order.customerOrderID !== undefined)?.customerOrderID ?? null)
    : null;
    const customerOrder: CustomerOrder = {
      CustomerOrderID: customerOrderID, 
      CustomerId: this.formData.CustomerId ?? this.customerSelected?.CustomerID,
      CustomerOrderType: this.formData.customerOrderTypeSelected ?? this.customerOrderTypeSelected,
      //CustomerId: 1,
      OQA: this.formData.OQA,
      Bake: this.formData.Bake,
      PandL: this.formData.PandL,
      CompanyName: this.formData.CompanyName,
      ContactPerson: this.formData.ContactPerson,
      ContactPhone: this.formData.ContactPhone,
      Address1: this.formData.Address1,
      Address2: this.formData.Address2 || null,
      City: this.formData.City,
      State: this.formData.State,
      Zip: this.formData.Zip,
      Country: this.formData.Country,
      OrderStatus: null,
      RecordStatus: customerOrderID != null ? 'U' : 'I',
      Active: true,
      CustomerOrderDetails: Array.from(this.selectedRecords)
    };
 
    const payload: OrderRequest = {
      CustomerOrder: [customerOrder]
    };


    this.apiService.processCustomerOrder(payload).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.customerAdded.emit();
        this.cancel.emit();
        
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });


    
  

  }

}


