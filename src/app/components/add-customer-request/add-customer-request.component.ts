import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CustomerService } from '../../services/customer.service';  // Adjust the path as necessary
import { CellClickEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { CustomerOrder, OrderRequest } from '../add-customer-request/customerorder'
import { AppService } from 'src/app/services/app.service';
import { ICON, MESSAGES, Customer } from 'src/app/services/app.interface';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-customer-request',
  templateUrl: './add-customer-request.component.html',
  styleUrls: ['./add-customer-request.component.scss']
})
export class AddCustomerRequestComponent implements OnInit {

  gridDataResult: GridDataResult = { data: [], total: 0 };
  customer: Customer[] = []
  customerSelected: Customer | undefined;
  deviceTypes: string[] = ['Device', 'Hardware', 'All'];  // Array to hold device types
  deviceTypeSelected: string = 'Device';  // Variable to hold the selected device type
  lotNumber: string | null = null;  // Lot number
  // below code can be changed/removed


  public columns: any[] = [];  // Array to hold column configurations
  // Create an EventEmitter to emit the cancel event to the parent
  @Output() cancel = new EventEmitter<void>();

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
  constructor(private customerService: CustomerService, public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.customer = this.appService.masterData.customer;

    console.log('Component initialized or reloaded');
    this.initializeColumns();
  }


  onSelectionChange(event: any): void {

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

  cancelRequest(): void {
    this.cancel.emit();  // Emit the cancel event when Cancel button is clicked
  }

  // Function to load data from the API based on selected filters
  onSearch(): void {
    const customerId = this.customerSelected?.customerID || 1;
    const goodsType = this.deviceTypeSelected || 'All';  // Fallback to 'All' if undefined
    const lotNumber = this.lotNumber || 'null';  // Fallback to 'null' if not set

    this.apiService.getInventory(customerId, goodsType, lotNumber).subscribe({
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

    // Close the cell after the edit
    sender.closeCell();
  }

  submitForm(): void {



    const customerOrder: CustomerOrder = {
      CustomerOrderID: null,
      CustomerId: this.customerSelected?.customerID || 1,
      //CustomerId: 1,
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

    this.apiService.processCustomerOrder(payload).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        
        
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
        console.log(err);
      }
    });


    const customerId = this.customerSelected?.customerID || 1;
    const goodsType = this.deviceTypeSelected || 'All';  // Fallback to 'All' if undefined
    const lotNumber = this.lotNumber || 'null';  // Fallback to 'null' if not set

    this.apiService.getInventory(customerId, goodsType, lotNumber).subscribe({
      next: (res: any) => {
        console.log(res);
        this.gridDataResult.data = res;
      },
      error: (err) => {
        this.gridDataResult.data = []
      }
    });
  

  }

}
