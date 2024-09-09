import { Component, OnInit,ChangeDetectorRef,NgZone, EventEmitter, Output  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,of  } from 'rxjs';
import { CustomerService } from '../../services/customer.service';  // Adjust the path as necessary
import { GridComponent, CellClickEvent,SelectionEvent ,SaveEvent } from '@progress/kendo-angular-grid';
import { CustomerOrder, CustomerOrderDetail, OrderRequest } from '../add-customer-request/customerorder'
import { AppService } from 'src/app/services/app.service';
import { Receipt, ICON, MESSAGES } from 'src/app/services/app.interface';

@Component({
  selector: 'app-add-customer-request',
  templateUrl: './add-customer-request.component.html',
  styleUrls: ['./add-customer-request.component.scss']
})
export class AddCustomerRequestComponent implements OnInit {


  public columns: any[] = [];  // Array to hold column configurations
 // Create an EventEmitter to emit the cancel event to the parent
@Output() cancel = new EventEmitter<void>();

  //public gridAddData$: Observable<any[]> = of([]);  // Observable for grid data, initialized as empty array
  public gridAddData: any[] = [];
  public customers$: Observable<any[]> = of([]);  // Observable for customers, initialized as empty array
 
  public selectedCustomer: any = null; // Selected customer ID
  public deviceTypes: string[] = ['Device', 'Hardware', 'All'];  // Array to hold device types
  public selectedDeviceType: string='Device';  // Variable to hold the selected device type
  public lotNumber: string | null = null;  // Lot number
  //public selectedRecords: any[] = []; // Array to track selected records
  public selectableSettings = { checkboxOnly: true, mode: 'multiple' };
  public selectedRecords: Set<any> = new Set<any>(); // Use Set to track unique selected records
  public formData = {
    oqa: false,
    bake: false,
    pl: false,
    contactName: '',
    companyName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  };
  constructor(private http: HttpClient,private cdr: ChangeDetectorRef,private ngZone: NgZone,private customerService: CustomerService,public appService: AppService) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.customers$ = this.customerService.getCustomers();
    
 
  }

  
    onSelectionChange(event: any): void {
      debugger;
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
    }

  initializeColumns(): void {
    this.columns = [
     /*  { field: 'receiptID', title: 'Receipt ID', width: 100 },
      { field: 'inventoryID', title: 'Inventory ID', width: 100 },
      { field: 'hardwareType', title: 'Hardware Type', width: 150, template: (dataItem: any) => dataItem.hardwareType || 'N/A' }, */
      { field: 'iseLotNum', title: 'ISE Lot Number', width: 100 },
      { field: 'customerLotNum', title: 'Customer Lot Number', width: 100 },
      { field: 'expectedQty', title: 'Expected Quantity', width: 60 },
      { field: 'expedite', title: 'Expedite', width: 60, template: (dataItem: any) => dataItem.expedite ? 'Yes' : 'No' },
      { field: 'partNum', title: 'Part Number', width: 100 },
      { field: 'labelCount', title: 'Label Count', width: 60 },
      // { field: 'coo', title: 'Country of Origin (COO)', width: 100 },
      { field: 'dateCode', title: 'Date Code', width: 100 },
      // { field: 'isHold', title: 'Is Hold', width: 80, template: (dataItem: any) => dataItem.isHold ? 'Yes' : 'No' },
      { field: 'holdComments', title: 'Hold Comments', width: 100, template: (dataItem: any) => dataItem.holdComments || 'N/A' },
      { field: 'shippedQty', title: 'Shipped Quantity', width: 60, editable: true },
      // { field: 'createdOn', title: 'Created On', width: 150, template: (dataItem: any) => new Date(dataItem.createdOn).toLocaleString() },
      // { field: 'modifiedOn', title: 'Modified On', width: 150, template: (dataItem: any) => new Date(dataItem.modifiedOn).toLocaleString() },
      // { field: 'active', title: 'Active', width: 80, template: (dataItem: any) => dataItem.active ? 'Yes' : 'No' }
    ];
  }
  // Function to handle customer selection
 onCustomerChange(value: any): void {
    console.log('Selected Customer:', value);
    this.selectedCustomer =  value.customerID;  // Update the selectedCustomer with the selected value
  } 
  cancelRequest(): void {
    this.cancel.emit();  // Emit the cancel event when Cancel button is clicked
  }
    
  onDeviceTypeChange(value: string): void {

    console.log('Selected Device Type:', value);
    this.selectedDeviceType = value;  // Update the selectedDeviceType with the selected value
  }


 // Function to load data from the API based on selected filters
 onSearch(): void {
  debugger;
  const customerId = this.selectedCustomer;
  const goodsType = this.selectedDeviceType || 'All';  // Fallback to 'All' if undefined
  const lotNumber = this.lotNumber || 'null';  // Fallback to 'null' if not set




// Assign the Observable directly to the gridAddData$
//this.gridAddData$ = this.customerService.getGridData(customerId, goodsType, lotNumber);

this.customerService.getGridData(customerId, goodsType, lotNumber).subscribe({
  next: (data) => {
    // Handle the data received from the API
    
    //this.gridAddData$ = of(data);
    this.gridAddData = data;
    //alert(data.length)
    this.cdr.detectChanges();
  },
  error: (err) => {
    // Handle the error
    console.error('Error fetching grid data:', err);
    //this.gridAddData$ = of([]);
    this.gridAddData = [];
    this.cdr.detectChanges();
  },
  complete: () => {
    // Optionally handle the completion of the Observable
    console.log('API call completed');
  }
});


/* this.customerService.getGridData(customerId, goodsType, lotNumber).subscribe(data => {
  this.gridAddData$ = of(data);  // Reassign gridAddData$ with fresh data observable
  this.cdr.detectChanges();   // Manually trigger change detection if needed
}); */
 
}



  editHandler({ sender, rowIndex, columnIndex, dataItem }: CellClickEvent): void {
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

    //alert(dataItem.shippedQty);
  }

cellCloseHandler({ sender, dataItem, column }: any): void {
  // Check if the column being edited is 'shippedQty'
  if (column.field === 'shippedQty') {
  
    // The new value is already bound to the dataItem via ngModel
    console.log('Updated shippedQty:', dataItem.shippedQty);  // This should log the new value
  }

  // Close the cell after the edit
  sender.closeCell();
}

  submitForm(): void {

 

    const customerOrder: CustomerOrder = {
      CustomerOrderID: null,
      //CustomerId: this.selectedCustomer,
      CustomerId: 1,
      OQA: this.formData.oqa,
      Bake: this.formData.bake,
      PandL: this.formData.pl,
      CompanyName: this.formData.companyName,
      ContactPerson: this.formData.contactName,
      ContactPhone: this.formData.phoneNumber,
      Address1: this.formData.addressLine1,
      Address2: this.formData.addressLine2 || null,
      City: this.formData.city,
      State: this.formData.state,
      Zip: this.formData.zip,
      Country: this.formData.country,
      OrderStatus: null,
      RecordStatus: 'I',
      Active: true,
      CustomerOrderDetails: Array.from(this.selectedRecords)
    };

    const payload: OrderRequest = {
      CustomerOrder: [customerOrder]
    };
   

    this.customerService.processCustomerOrder(payload)
      .subscribe(response => {
        console.log('Form and records saved successfully', response);
        this.appService.successMessage(MESSAGES.DataSaved);
      }, error => {
        console.error('Error saving form and records', error);
      });

   
  }

}
