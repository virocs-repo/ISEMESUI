import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { CustomerService } from '../../services/customer.service';  // Adjust the path as necessary
import { CellClickEvent, GridComponent, GridDataResult,RowArgs  } from '@progress/kendo-angular-grid';
import { CustomerOrder, OrderRequest,CustomerAddress } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ICON, MESSAGES, Customer } from 'src/app/services/app.interface';
import { ApiService } from 'src/app/services/api.service';
import { AddShippingAddressComponent } from '../add-shipping-address/add-shipping-address.component';

@Component({
  selector: 'app-add-customer-request',
  templateUrl: './add-customer-request.component.html',
  styleUrls: ['./add-customer-request.component.scss']
})
export class AddCustomerRequestComponent implements OnInit {
  readonly ICON = ICON
  @Input() isEditMode: boolean = true;  // Use this flag to control view/edit mode
  @Input() addCustomerMode: boolean = false;  // Use this flag to control view/edit mode
  @Output() customerAdded = new EventEmitter<void>();
  @Input() customerOrd: any;  // Receive the customer order data
  @Input() formOrdData:any;
  @Input() deliveryInfo:any | null;
  @ViewChild(AddShippingAddressComponent) shippingAddressComponent!: AddShippingAddressComponent;
  @ViewChild('grid', { static: true }) grid!: GridComponent; 
  gridDataResult: GridDataResult = { data: [], total: 0 };
  addressDataResult: GridDataResult = { data: [], total: 0 };
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
  public columns: any[] = [];
  public addressDataResultcolumns: any[] = [];  // Array to hold column configurations
  // Create an EventEmitter to emit the cancel event to the parent
  @Output() cancel = new EventEmitter<void>();
 
  //public selectedRecords: any[] = []; // Array to track selected records
  public selectableSettings = { checkboxOnly: true, mode: 'multiple' };
  public selectedRecords: Set<any> = new Set<any>(); // Use Set to track unique selected records
  public formData : any = {}; 
  
  constructor(private customerService: CustomerService, public appService: AppService, private apiService: ApiService) { }

  async ngOnInit(): Promise<void> {
    this.formData.OQA = false;   // Initialize OQA as false
    this.formData.Bake = false;  // Initialize Bake as false
    this.formData.PandL = false; // Initialize P&L as false
    this.formData.CustomerId=null;
    this.customer = this.appService.masterData.entityMap.Customer;
    this.formData.customerOrderTypeSelected=this.customerOrderTypeSelected;
   

    this.initializeColumns();
    if (!this.addCustomerMode && this.customerOrd && this.customerOrd.length > 0) {
      this.gridDataResult.data = this.customerOrd;
      this.formData=this.formOrdData;
      this.customerSelected={}as Customer;
      this.customerSelected.CustomerID = this.formOrdData.CustomerId;
      this.initializeSelectedRows();
    }
    this.getLotNumbers();
    //  this.getContactPersonDetails(this.customerSelected?.CustomerID ?? 0, null);
  }
  onCustomerChange(selectedCustomer: any) {
    this.shippingAddressComponent.selectedShippingMethod=null;
    this.shippingAddressComponent.selectedCourier = null;
  this.shippingAddressComponent.selectedDestination = null;
  this.shippingAddressComponent.selectedContactPerson=null;
    if (selectedCustomer && selectedCustomer.CustomerID) {
      this.customerSelected = selectedCustomer;
      // this.getContactPersonDetails(this.customerSelected?.CustomerID ?? 0, null);
    } else {
      this.shippingAddressComponent.ContactPersonList = []; 
    }
  }
  emailError: boolean = false;
  emailMessage: string = "";
  validateEmailOnSubmit(): boolean {
    const inputValue = this.shippingAddressComponent.shippingDetailsData.Email ? this.shippingAddressComponent.shippingDetailsData.Email.trim() : "";
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const multipleEmails = inputValue.includes(",") || inputValue.includes(";") || inputValue.split(" ").length > 1;
    if (!inputValue) {
      return true;
    }
    if (multipleEmails) {
      this.emailError = true;
      this.emailMessage = "Please enter valid Email Address - Shipping Info";
      return false;
    } else if (!emailPattern.test(inputValue)) {
      this.emailError = true;
      this.emailMessage = "Please enter valid Email Address - Shipping Info";
      return false;
    }
    return true; 
  }
  onemailErrorClose(): void {
    this.emailError = false;
  }
  onErrorClose(): void {
    this.onemailErrorClose();
  }
  shipAlertEmailError: boolean = false;
shipAlertEmailMessage: string = "";

validateShipAlertEmail(): boolean {
  const inputValue = this.shippingAddressComponent.shippingDetailsData.ShipAlertEmail ? this.shippingAddressComponent.shippingDetailsData.ShipAlertEmail.trim() : "";
  if (!inputValue) return true; 
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const emailList = inputValue.split(/[,;\s]+/).filter(email => email.length > 0);
  for (const email of emailList) {
    if (!emailPattern.test(email)) {
      this.shipAlertEmailError = true;
      this.shipAlertEmailMessage = "Please enter valid Ship Alert Email Id(s) - Shipping Info.";
      return false;
    }
  }
  const uniqueEmails = new Set(emailList);
  if (uniqueEmails.size !== emailList.length) {
    this.shipAlertEmailError = true;
    this.shipAlertEmailMessage = "Duplicate Ship Alert Email Exist - Shipping Info.";
    return false;
  }
  return true;
}

onShipAlertEmailErrorClose(): void {
  this.shipAlertEmailError = false;
}
unitValueError: boolean = false;
unitValueMessage: string = "";

validateUnitValue(): boolean {
  const unitValue = this.shippingAddressComponent.UnitValue ?? 0; 

  if (unitValue > 999999999.9999) {
    this.unitValueError = true;
    this.unitValueMessage = "Unit Value cannot be greater than 999999999.9999.";
    return false;
  }
  return true;
}
onUnitValueErrorClose(): void {
  this.unitValueError = false;
}
totalValueError: boolean = false;
totalValueMessage: string = "";
validateTotalValue(): boolean {
  const totalValue = this.shippingAddressComponent.TotalValue ?? 0;
  if (totalValue > 50000) {
    this.totalValueError = true;
    this.totalValueMessage = "Total Value cannot be greater than 50,000.00. Please Check Unit Value and units.";
    return false;
  }
  return true;
}
onTotalValueErrorClose(): void {
  this.totalValueError = false;
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
  // onShippingMethodChange(method: any): void {

  //   alert(JSON.stringify(this.selectedShippingMethod));
  // }
  
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
      (event.selectedRows || []).forEach((row: { dataItem: any }) => {
        let customerOrderDetailID = row.dataItem.customerOrderDetailID ?? null;
    
        const recordStatus = customerOrderDetailID !== null ? 'U' : 'I';
    
        const selectedRecord = {
          CustomerOrderDetailID: customerOrderDetailID, 
          InventoryID: row.dataItem.inventoryID,
          ShippedQty: Number(row.dataItem.shippedQty),
          RecordStatus: recordStatus
        };
    
        this.selectedRecords.add(selectedRecord); 
        this.selectedcheckBoxs.add(row.dataItem.inventoryID);
      });
    
      (event.deselectedRows || []).forEach((row: { dataItem: any }) => {
        let customerOrderDetailID = row.dataItem.customerOrderDetailID ?? null;
        const uniqueKey = row.dataItem.inventoryID || customerOrderDetailID;


    if (customerOrderDetailID !== null) {
      this.selectedRecords.forEach(record => {
        if (record.CustomerOrderDetailID === customerOrderDetailID && record.InventoryID === row.dataItem.inventoryID) {
          record.RecordStatus = 'D'; 
        }
      });
    } else {
      this.selectedRecords.forEach(record => {
        if (record.InventoryID === row.dataItem.inventoryID) {
          this.selectedRecords.delete(record);
        }
      });
    }

    this.selectedcheckBoxs.delete(row.dataItem.inventoryID);
      });
    
      console.log('Updated Selected Records:', Array.from(this.selectedRecords)); 
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
    if (!this.shippingAddressComponent.selectedShippingMethod?.masterListItemId) {
      this.appService.errorMessage('Please select ShippingMethod');
      return;
    } 
    if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1448) {
      if (!this.validateEmailOnSubmit()) {
        return; 
      }
      if (!this.validateShipAlertEmail()) {
        return; 
      }
      if (!this.shippingAddressComponent.shippingDetailsData.ContactPerson) {
        this.appService.errorMessage('Please enter contact person');
        return;
      } 
    }
    if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1447) {
      if (!this.validateShipAlertEmail()) {
        return; 
      }
    }
    if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1534) {
      if (!this.validateShipAlertEmail()) {
        return; 
      }
      if (!this.validateTotalValue()) {
        return; 
      }
      if (!this.validateUnitValue()) {
        return; 
      }
      if (!this.shippingAddressComponent.selectedCOO?.masterListItemId) {
        this.appService.errorMessage('Please select COO.');
        return;
      }
  
      if (!this.shippingAddressComponent.selectedCIFrom?.masterListItemId) {
        this.appService.errorMessage('Please select CI Form.');
        return;
      }
      if (!this.shippingAddressComponent.UnitValue) {
        this.appService.errorMessage('Please enter UnitValue.');
        return;
      }
    }
    if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1446) {
      if (!this.shippingAddressComponent.selectedDestination?.masterListItemId) {
        this.appService.errorMessage('Please select Destination.');
        return;
      }
      if (!this.shippingAddressComponent.selectedCourier?.masterListItemId) {
        this.appService.errorMessage('Please select Courier Name.');
        return;
      }
      if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 3) {
        if (!this.validateShipAlertEmail()) {
          return; 
        }
        if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select Service Type.');
          return;
        }
        if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill Transportation To.');
          return;
        }
        if (!this.shippingAddressComponent.Courier.BillTransportationAcct) {
          this.appService.errorMessage('Please enter Trasportation Acct#.');
          return;
        }
      }
  
      if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 4) {
        if (!this.validateEmailOnSubmit()) {
          return; 
        }
        if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill Transportation To.');
          return;
        }
        if (!this.shippingAddressComponent.Courier.UPSAccountNumber) {
          this.appService.errorMessage('Please enter UPS Account Number.');
          return;
        }
        if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select UPS Service.');
          return;
        }
      }
      if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 5) {
        if (!this.validateUnitValue()) {
          return; 
        }
        if (!this.shippingAddressComponent.selectedCIFrom?.masterListItemId) {
          this.appService.errorMessage('Please select CI Form.');
          return;
        }
        if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select Service Type.');
          return;
        }
        if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill Transportation To.');
          return;
        }
        if (!this.shippingAddressComponent.Courier.BillTransportationAcct) {
          this.appService.errorMessage('Please enter Bill Trasportation Acct#.');
          return;
        }
        if (!this.shippingAddressComponent.selectedBillDutyTaxFeesTo?.itemText) {
          this.appService.errorMessage('Please select Bill Duties/taxes/fees.');
          return;
        }
        if (!this.shippingAddressComponent.Courier.Duties) {
          this.appService.errorMessage('Please enter Duties/taxes/fees Acc#.');
          return;
        }
        if (!this.shippingAddressComponent.selectedCOO?.masterListItemId) {
          this.appService.errorMessage('Please select COO.');
          return;
        }
        if (!this.shippingAddressComponent.UnitValue) {
          this.appService.errorMessage('Please enter UnitValue.');
          return;
        }
      }
      if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 6) {
        if (!this.validateUnitValue()) {
          return; 
        }
        if (!this.validateEmailOnSubmit()) {
          return; 
        }
        if (!this.validateTotalValue()) {
          return; 
        }
        if (!this.validateShipAlertEmail()) {
          return; 
        }
        if (!this.shippingAddressComponent.selectedCIFrom?.masterListItemId) {
          this.appService.errorMessage('Please select CI Form.');
          return;
        }
        if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill Transportation To.');
          return;
        }
        if (!this.shippingAddressComponent.selectedBillDutyTaxFeesTo?.itemText) {
          this.appService.errorMessage('Please select Bill Duties/taxes/fees.');
          return;
        }
        if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select UPS Service.');
          return;
        }
        if (!this.shippingAddressComponent.Courier.UPSAccountNumber) {
          this.appService.errorMessage('Please enter UPS Account Number.');
          return;
        }
        if (!this.shippingAddressComponent.selectedCOO?.masterListItemId) {
          this.appService.errorMessage('Please select Country of Origin.');
          return;
        }
        if (!this.shippingAddressComponent.Quantity) {
          this.appService.errorMessage('Please enter Units.');
          return;
        }
        if (!this.shippingAddressComponent.UnitValue) {
          this.appService.errorMessage('Please enter UnitValue.');
          return;
        }
        if (!this.shippingAddressComponent.Courier.Height) {
          this.appService.errorMessage('Please enter Acct#.');
          return;
        }
      }
      if (this.shippingAddressComponent.selectedCourier?.masterListItemId == 7) {
        if (!this.validateUnitValue()) {
          return; 
        }
        if (!this.validateShipAlertEmail()) {
          return; 
        }
        if (!this.shippingAddressComponent.selectedCIFrom?.masterListItemId) {
          this.appService.errorMessage('Please select CI Form.');
          return;
        }
        if (!this.shippingAddressComponent.selectedServiceType?.itemText) {
          this.appService.errorMessage('Please select Product.');
          return;
        }
        if (!this.shippingAddressComponent.selectedBillTransport?.itemText) {
          this.appService.errorMessage('Please select Bill To.');
          return;
        }
        if (!this.shippingAddressComponent.Courier.BillTransportationAcct) {
          this.appService.errorMessage('Please enter Bill To Account.');
          return;
        }
        if (!this.shippingAddressComponent.selectedBillDutyTaxFeesTo?.itemText) {
          this.appService.errorMessage('Please select Bill Duties/taxes/fees.');
          return;
        }
        if (!this.shippingAddressComponent.Courier.Duties) {
          this.appService.errorMessage('Please enter Duties/taxes/fees Acc#.');
          return;
        }
        if (!this.shippingAddressComponent.selectedCOO?.masterListItemId) {
          this.appService.errorMessage('Please select Country of Origin.');
          return;
        }
        if (!this.shippingAddressComponent.selectedCommodityOrigin?.itemText) {
          this.appService.errorMessage('Please select Commodity Origin.');
          return;
        }
        if (!this.shippingAddressComponent.UnitValue) {
          this.appService.errorMessage('Please enter UnitValue.');
          return;
        }
      }
    }
    if (this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1447 || 
      this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1446 || 
      this.shippingAddressComponent.selectedShippingMethod?.masterListItemId === 1534) {

    
    if (!this.shippingAddressComponent.address.Country) {
      this.appService.errorMessage('Please enter Country.');
      return;
    }

    if (!this.shippingAddressComponent.shippingDetailsData.ContactPerson) {
      this.appService.errorMessage('Please enter Contact Name.');
      return;
    }

    if (!this.shippingAddressComponent.address.CompanyName) {
      this.appService.errorMessage('Please enter Company Name.');
      return;
    }

    if (!this.shippingAddressComponent.address.Address1) {
      this.appService.errorMessage('Please enter Address 1.');
      return;
    }
    if (!this.shippingAddressComponent.address.Phone) {
      this.appService.errorMessage('Please enter Telephone.');
      return;
    }
    if (!this.shippingAddressComponent.address.State) {
      this.appService.errorMessage('Please enter State/Province.');
      return;
    }
    if (!this.shippingAddressComponent.address.City) {
      this.appService.errorMessage('Please enter City.');
      return;
    }
    if (!this.shippingAddressComponent.address.PostCode) {
      this.appService.errorMessage('Please enter PostCode.');
      return;
    }
  }
  const formattedPickUpDate = this.shippingAddressComponent.ExpectedPickUpDate ? this.shippingAddressComponent.ExpectedPickUpDate.toISOString().split('T')[0] : null;
  const PickUptime = this.shippingAddressComponent.shippingDetailsData.ExpectedTime;
  const formattedshipDate = this.shippingAddressComponent.ShipDate ? this.shippingAddressComponent.ShipDate.toISOString().split('T')[0] : null;
  const Shiptime = this.shippingAddressComponent.shippingDetailsData.ShippingTime; 
   
     
    const customerAddress: CustomerAddress = {
      ShippingMethodId:this.shippingAddressComponent.selectedShippingMethod.masterListItemId,
      IsForwarder: this.shippingAddressComponent.shippingDetailsData.Forwarder,  
      ContactPerson: this.shippingAddressComponent.shippingDetailsData.ContactPerson,
      Phone: this.shippingAddressComponent.address.Phone, 
      ShipAlertEmail: this.shippingAddressComponent.shippingDetailsData.ShipAlertEmail,
      ExpectedTime: (formattedPickUpDate && PickUptime) ? `${formattedPickUpDate} ${PickUptime}` : null,  
      Comments: this.shippingAddressComponent.address.Comments,  
      SpecialInstructionforShipping: this.shippingAddressComponent.address.SpecialInstructions,  
      PackingSlipComments: this.shippingAddressComponent.address.PackingComments,  
      CIComments: this.shippingAddressComponent.address.InvoiceComments,
      AddressId:this.shippingAddressComponent.address.addressId,  
      Email:this.shippingAddressComponent.shippingDetailsData.Email,
      Country:this.shippingAddressComponent.address.Country,
      CompanyName:this.shippingAddressComponent.address.CompanyName,
      Address1:this.shippingAddressComponent.address.Address1,
      Address2:this.shippingAddressComponent.address.Address2,
      Address3:this.shippingAddressComponent.address.Address3,
      Zip:this.shippingAddressComponent.address.PostCode,
      StateProvince:this.shippingAddressComponent.address.State,
      City:this.shippingAddressComponent.address.City,
      Extension:this.shippingAddressComponent.address.Ext,
      ShipDate:(formattedshipDate && Shiptime) ? `${formattedshipDate} ${Shiptime}` : null,
      CountryOfOrigin:this.shippingAddressComponent.selectedCOO?.itemText,
      CIFromId:this.shippingAddressComponent.selectedCIFrom?.masterListItemId,
      UnitValue:this.shippingAddressComponent.UnitValue,
      TotalValue:this.shippingAddressComponent.TotalValue,
      Units:this.shippingAddressComponent.Quantity,
      ECCN:this.shippingAddressComponent.shippingDetailsData.ECCN,
      ScheduleBNumber:this.shippingAddressComponent.ScheduleB,
      LicenseType:this.shippingAddressComponent.selectedLicense?.itemText,
      CommidityDescription:this.shippingAddressComponent.shippingDetailsData.CommodityDescription,
      UltimateConsignee:this.shippingAddressComponent.shippingDetailsData.UltimateConsignee,
      DestinationId:this.shippingAddressComponent.selectedDestination?.masterListItemId,
      CourierId:this.shippingAddressComponent.selectedCourier?.masterListItemId,
      ServiceType:this.shippingAddressComponent.selectedServiceType?.itemText,
      PackageType:this.shippingAddressComponent.Courier.PackageType,
      BillTransportationTo:this.shippingAddressComponent.selectedBillTransport?.itemText,
      BillTransportationAcct:this.shippingAddressComponent.Courier.BillTransportationAcct,
      CustomerReference:this.shippingAddressComponent.Courier.CustomerReference,
      NoOfPackages:this.shippingAddressComponent.Courier.NumberOfPackages,
      Weight:this.shippingAddressComponent.Courier.Weight,
      PackageDimentions:this.shippingAddressComponent.Courier.PackageDimension,
      IsResidential:this.shippingAddressComponent.Courier.Residential,
      AccountNumber:this.shippingAddressComponent.Courier.UPSAccountNumber,
      ReferenceNumber1:this.shippingAddressComponent.Courier.Length,
      ReferenceNumber2:this.shippingAddressComponent.Courier.Width,
      OtherAccountNumber:this.shippingAddressComponent.Courier.Height,
      TaxId:this.shippingAddressComponent.Courier.Taxid,
      Attention:this.shippingAddressComponent.Courier.Attention,
      InvoiceNumber:this.shippingAddressComponent.Courier.InvoiceNumber,
      BillDutyTaxFeesTo:this.shippingAddressComponent.selectedBillDutyTaxFeesTo?.itemText,
      BillDutyTaxFeesAcct:this.shippingAddressComponent.Courier.Duties,
      CommodityDescription:this.shippingAddressComponent.shippingDetailsData.CommodityDescription,
      ScheduleBUnits1:this.shippingAddressComponent.Courier.ScheduleBUnits1,
      PurchaseNumber:this.shippingAddressComponent.Courier.PurchaseNumber,
      ShipmentReference:this.shippingAddressComponent.shippingDetailsData.Height,
      CustomsTermsOfTradeId:this.shippingAddressComponent.selectedCustomeTT?.masterListItemId, 
      Qty:this.shippingAddressComponent.Courier.Qty,
      CommodityOrigin:this.shippingAddressComponent.selectedCommodityOrigin?.itemText,
      BillToCountry:this.shippingAddressComponent.billToAddress.Country,
      BillToContactPerson:this.shippingAddressComponent.billToAddress.ContactPerson,
      BillToCompanyName:this.shippingAddressComponent.billToAddress.CompanyName,
      BillToAddress1:this.shippingAddressComponent.billToAddress.Address1,
      BillToAddress2:this.shippingAddressComponent.billToAddress.Address2,
      BillToAddress3:this.shippingAddressComponent.billToAddress.Address3,
      BillToPhone:this.shippingAddressComponent.billToAddress.TelePhone,
      BillToStateProvince:this.shippingAddressComponent.billToAddress.State,
      BillToCity:this.shippingAddressComponent.billToAddress.City,
      BillToZip:this.shippingAddressComponent.billToAddress.PostCode,
      BillToExtension:this.shippingAddressComponent.billToAddress.Ext,
      CustomerBillTOAddressId:this.shippingAddressComponent.billToAddress.billtoaddressId,
      BillCheck:this.shippingAddressComponent.sameAsShipTo,
      RejectLocationId:this.shippingAddressComponent.selectedRejectLocation?.masterListItemId
    };
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
      CustomerOrderDetails: Array.from(this.selectedRecords),
      IsHoldShip:this.shippingAddressComponent.shippingDetailsData.HoldShip,
     CustomerAddress:[customerAddress]
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


