import { Component, OnInit } from '@angular/core';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { eyeIcon, folderIcon, pencilIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { ApiService } from 'src/app/services/api.service';
import { Customer, CustomerType, EntityType, ICON, ReceiptLocation } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  readonly ICON = ICON
  public pageSize = 10;
  public skip = 0;
  // public receipts: Receipt[] = [];
  // public gridData: Receipt[] = [];
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  isDisabledBehalfOfCusotmer = false;
  customerTypes: CustomerType[] = []
  customerTypeSelected: CustomerType | undefined;
  receiptLocation: ReceiptLocation[] = []
  receiptLocationSelected: ReceiptLocation | undefined;
  customer: Customer[] = []
  customerSelected: Customer | undefined;
  behalfOfCusotmerSelected: Customer | undefined;
  customerTextField: 'CustomerName' | 'VendorName' = 'CustomerName'
  customerValueField: 'CustomerID' | 'VendorID' = 'CustomerID'
  columnData = [
    { title: "ISE Lot#", field: 'iseLotNumber', isLink: true },
    { title: "Receipt #", field: 'receiptID', isLink: true },
    { title: "Qty", field: 'qty' },
    { title: "Expedite", field: 'expedite' },
    { title: "Part #", field: 'partNum' },
    { title: "Unprocessed", field: 'unprocessed' },
    { title: "Good", field: 'good' },
    { title: "Reject", field: 'reject' },
    { title: "COO", field: 'coo' },
    { title: "Date Code", field: 'dateCode' },
    { title: "FG Part #", field: 'fgtPartNum' },
    { title: "Status", field: 'status' },
    // { title: "Hold", field: 'Status' }
  ]
  
  entityType: string[] = ['Customer' , 'Vendor'];  // Array to hold device types
  entityTypeSelected: string = 'Customer';  // Variable to hold the selected device type
  constructor(private apiService: ApiService,public appService: AppService) { }

  ngOnInit(): void {
    this.customerTypes = this.appService.masterData.customerType;
    this.customer = this.appService.masterData.entityMap.Customer;
    // this.receiptLocation = this.appService.masterData.receiptLocation; temp
    this.receiptLocation = this.appService.m.ReceiptLocation;
    this.loadGridData();
  }


  loadGridData() {

    this.apiService.getallinventorydata().subscribe({
      next: (v: any) => {
        this.gridDataResult.data = v;
        this.gridDataResult.total = v.length

      },
      error: (v: any) => { }
    });
  }
  onSearch(): void {
    this.skip = 0;  // Reset pagination when searching
    debugger;
    let custTypeID =null;
    let custVendorID=null;
    let behalfOfCustomerID=null;
    let receivingFacilityID=null;

    custTypeID=this.customerTypeSelected?.customerTypeID;
    custVendorID=this.customerSelected?.CustomerID;
    if(this.customerTypeSelected?.customerTypeName =='Vendor')
    {
      custVendorID=this.customerSelected?.VendorID;
      behalfOfCustomerID=this.behalfOfCusotmerSelected?.VendorID;
    }
    else
    {
      custVendorID=this.customerSelected?.CustomerID;
      behalfOfCustomerID=this.behalfOfCusotmerSelected?.CustomerID;
    }
    receivingFacilityID = this.receiptLocationSelected?.receiptLocationID;

  debugger;
    this.apiService.getinventorydata(custTypeID,custVendorID,behalfOfCustomerID,receivingFacilityID).subscribe({
      next: (v: any) => {
        this.gridDataResult.data = v;
        this.gridDataResult.total = v.length

      },
      error: (v: any) => { }
    });
    
  }
  onChangeCustomerType() {
    console.log(this.customerTypeSelected)
    console.log(this)
    if (this.customerTypeSelected?.customerTypeName == 'Vendor') {
      this.isDisabledBehalfOfCusotmer = true
    } else {
      this.isDisabledBehalfOfCusotmer = false
    }
    if (this.customerTypeSelected?.customerTypeName) {
      this.initCustomersList(this.customerTypeSelected?.customerTypeName as any)
    }
  }

  private initCustomersList(entityType: EntityType) {
    // @ts-ignore
    this.customer = this.appService.masterData.entityMap[entityType]
    // @ts-ignore
    this.customerTextField = entityType + 'Name';
    // @ts-ignore
    this.customerValueField = entityType + 'ID';
   
  }
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    console.log(event);
    this.loadGridData();
  }

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
  public items: any[] = [
    { text: 'Item1', icon: 'edit' },
    { text: 'Item2', icon: 'delete' },
    { text: 'Item3', icon: 'copy' }
  ];

  isDialogOpen1 = false;
  isDialogOpen2 = false;
  isDialogOpen3 = false;

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }
  public eyeIcon: SVGIcon = eyeIcon;
  public pencilIcon: SVGIcon = pencilIcon;
  public onButtonClick(): void {
    console.log("click");
    this.isDialogOpen1 = !this.isDialogOpen1
  }
  onCellClick(event: any): void {
    console.log(event);
    switch (event.columnIndex) {
      case 1:
        this.openDialog();
        break;
      case 2:
        this.isDialogOpen3 = !this.isDialogOpen3
        break;

      default:
        break;
    }
  }
}
