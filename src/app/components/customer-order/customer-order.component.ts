import { Component, OnInit, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { HttpClient } from '@angular/common/http';
import { process, State } from '@progress/kendo-data-query';  // For Kendo filtering
import { environment } from 'src/environments/environment';
import { CustomerOrder, ICON, MESSAGES, OrderRequest } from 'src/app/services/app.interface';
import { ApiService } from 'src/app/services/api.service';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order.component.html',
  styleUrls: ['./customer-order.component.scss'],
  standalone: false
})
export class CustomerOrderComponent implements OnInit {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  public isEditMode: boolean = true;  // Default to edit mode
  public addCustomerMode : boolean = false; 
  
  readonly ICON = ICON
  public pageSize = 25;
  public skip = 0;
 selectedRowIndex: number = -1;
 private originalData: any[] = []; 
   public gridDataResult: GridDataResult = { data: [], total: 0 };
  public gridFilter: any = {
    logic: 'and',  // Filter logic (can be 'and' or 'or')
    filters: []
  };
  isEditButtonEnabled: boolean=true;
  public customerOrd: any = {}; 
  public formOrdData: any = {};
  public deliveryInfo: any = {}; 
  public searchTerm: string = '';
  format: string = 'yyyy-MM-dd'; // Date format for kendo-datetimepicker
  fromDate: Date | null = null;  // Variable to store the selected 'from' date
  toDate: Date | null = null;    // Variable to store the selected 'to' date
  public columnData: any[] = [

    { field: 'customerName', title: 'Customer Name' },
    //{ field: 'oqa', title: 'oqa' },
   // { field: 'bake', title: 'bake' },
   // { field: 'pandL', title: 'pandL' },
    { field: 'companyName', title: 'Company Name' },
    { field: 'contactPerson', title: 'Contact Person' },
    { field: 'contactPhone', title: 'Contact Phone' },
    //{ field: 'address', title: 'address' },
    { field: 'orderStatus', title: 'Order Status' },
    { field: 'active', title: 'Active' },
    { field: 'customerOrderType', title: 'CustomerOrderType' }
    // { field: 'createdOn', title: 'Created On' }
   // { field: 'modifiedOn', title: 'Modified On' }
  ];
  selectableSettings: any = {
    checkboxOnly: true,
    mode: 'single',
  }
  columnMenuSettings: any = {
    lock: false,
    stick: false,
    setColumnPosition: { expanded: true },
    autoSizeColumn: true,
    autoSizeAllColumns: true,
  }
  

  isDialogOpen = false;
  openDialog() {
  
    this.isDialogOpen = true;
    

  }

  onAddButtonClick(): void {
    this.addCustomerMode=true;
  
    this.openDialog();
  }
  closeDialog() {
    this.isDialogOpen = false;
    this.isEditMode=true;

   
  }
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadGridData();  // Reload data with pagination
  }

  rowActionMenu: MenuItem[] = [
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    
    { text: 'Edit Data', icon: 'edit', disabled: !this.isEditButtonEnabled, svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
    // { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
  ];
  constructor(private apiService: ApiService,public appService: AppService) { }

  ngOnInit(): void {
    this.loadGridData();
  }


  loadGridData() {

    this.apiService.getallCustomerOrder().subscribe({
      next: (v: any) => {
        // this.receipts = v;
        //this.gridDataResult.data = v;
        this.originalData = v;
        //this.gridDataResult.total = v.length;
        this.pageData(); // Apply search and pagination
        console.log(v);
      },
      error: (v: any) => { }
    });


  }

  pageData(): void {
 /*    const filteredData = this.searchTerm ? this.filterData(this.gridDataResult.data) : this.gridDataResult.data;

    // Paginate the data
    const paginatedData = filteredData.slice(this.skip, this.skip + this.pageSize);
    this.gridDataResult.data = paginatedData;
        this.gridDataResult.total =filteredData.length ; */

        const filteredData = this.filterData(this.originalData);
    const paginatedData = filteredData.slice(this.skip, this.skip + this.pageSize);
    this.gridDataResult.data = filteredData;
    this.gridDataResult.total = filteredData.length; 

   

   
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
  submitForm(): void {
    this.loadGridData();
  }

  onSearch(): void {
    // Pass Date objects directly
    const from_date = this.fromDate ?? undefined;
    const to_date = this.toDate ?? undefined;
   
    this.apiService.getallCustomerOrderwithDates(from_date, to_date).subscribe({
        next: (v: any) => {
   /*          this.gridDataResult.data = v;
            this.gridDataResult.total = v.length; */
            this.originalData = v;
            this.pageData();
        },
        error: (error: any) => {
            console.error('Error fetching CombinationLots', error);
        }
    });
   
     }
  onSearchMaster(): void {
    this.skip = 0;  // Reset pagination when searching
    this.pageData();  // Apply search and pagination
  }
  dataItemSelected:any;
  onCellClick(e: CellClickEvent): void {
    console.log(e);
    if (e.type === 'contextmenu') {
      const originalEvent = e.originalEvent;
      originalEvent.preventDefault();
      this.dataItemSelected = e.dataItem;
      this.selectedRowIndex = e.rowIndex;
      this.gridContextMenu.show({ left: originalEvent.pageX, top: originalEvent.pageY });
    }
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent) {
const dataItem = this.dataItemSelected;
const addressParts = dataItem.address.split(':');
this.formOrdData = {
  CustomerOrderID: dataItem.customerOrderID,
  CustomerId: dataItem.customerId,
  CustomerOrderType:dataItem.customerOrderType,
  OQA: dataItem.oqa,
  Bake: dataItem.bake,
  PandL: dataItem.pandL,
  CompanyName: dataItem.companyName,
  ContactPerson: dataItem.contactPerson,
  ContactPhone: dataItem.contactPhone,
  Address1: addressParts[0],  // First part of the address
  Address2: addressParts[1],  // Second part of the address
  City: addressParts[2],      // Third part is the city
  Zip: addressParts[3],       // Fourth part is the zip code
  State: addressParts[4],     // Fifth part is the state
  Country: addressParts[5],   // Sixth part is the country
  OrderStatus: dataItem.orderStatus,
  
  Active: dataItem.active
};

this.apiService.getShipmentdeliveryInfo(dataItem.deliveryInfoId).subscribe({
  next: (deliveryInfo:any) => {
    this.deliveryInfo = deliveryInfo;
  },
  error: (err) => {
    console.error('Error fetching shipment delivery info:', err);
  },
});

switch (e.item.text) {
  case 'View Data':
    // access the same in receipt component
    this.isEditMode = false;  
    this.addCustomerMode=false;
    this.apiService.viewEditCustomerOrder(dataItem.customerOrderID,false).subscribe({
      next: (v: any) => {
        // this.receipts = v;
        this.customerOrd = v;       
        this.openDialog()
      },
      error: (v: any) => { }
    });
    break;
  case 'Edit Data':
    this.isEditMode = true;  
    this.addCustomerMode=false;
    this.apiService.viewEditCustomerOrder(dataItem.customerOrderID,true).subscribe({
      next: (v: any) => {
        // this.receipts = v;
        this.customerOrd = v;        
        this.openDialog()
      },
      error: (v: any) => { }
    });
    break;
    case 'Void Data':
      const customervoidOrder: CustomerOrder = {
        CustomerOrderID: dataItem.customerOrderID,
        CustomerId: dataItem.customerId,
        CustomerOrderType: dataItem.customerOrderType,
        OQA: dataItem.oqa,
        Bake: dataItem.bake,
        PandL: dataItem.pandL,
        CompanyName: dataItem.companyName,
        ContactPerson: dataItem.contactPerson,
        ContactPhone: dataItem.contactPhone,
        Address1: addressParts[0], // First part of the address
        Address2: addressParts[1], // Second part of the address
        City: addressParts[2], // Third part is the city
        Zip: addressParts[3], // Fourth part is the zip code
        State: addressParts[4], // Fifth part is the state
        Country: addressParts[5], // Sixth part is the country
        OrderStatus: dataItem.orderStatus,
        Active: false,
        RecordStatus: 'D',
        CustomerOrderDetails: [],
        IsHoldShip:false,
        CustomerAddress:[]
      };
   
      const payload: OrderRequest = {
        CustomerOrder: [customervoidOrder]
      };

      this.apiService.processCustomerOrder(payload).subscribe({
        next: (v: any) => {
          this.appService.successMessage(MESSAGES.DataSaved);
          this.loadGridData();
          
        },
        error: (err) => {
          this.appService.errorMessage(MESSAGES.DataSaveError);
          console.log(err);
        }
      });


     
      break;

  default:
    break;
}



  }
  rowCallback = (context: any) => {
    return {
      'highlighted-row': context.index === this.selectedRowIndex
    };
  }


}
