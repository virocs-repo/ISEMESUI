import { Component, OnInit, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { eyeIcon, folderIcon, pencilIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { ApiService } from 'src/app/services/api.service';
import { Customer, CustomerType, EntityType, ICON, Receipt, ReceiptLocation } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  readonly ICON = ICON
  public pageSize = 25;
  public skip = 0;
 public receipts: Receipt[] = [];
  // public gridData: Receipt[] = [];
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  isDisabledBehalfOfCusotmer = false;
  customerTypes: CustomerType[] = []
  customerTypeSelected: CustomerType | undefined;
 receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  customer: Customer[] = []
  customerSelected: Customer | undefined;
  behalfOfCusotmerSelected: Customer | undefined;
  customerTextField: 'CustomerName' | 'VendorName' = 'CustomerName'
  customerValueField: 'CustomerID' | 'VendorID' = 'CustomerID'
  columnData = [
    { title: "ISE Lot#", field: 'iseLotNumber' },
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


  format: string = 'yyyy-MM-dd'; // Date format for kendo-datetimepicker
  fromDate: Date | null = null;  // Variable to store the selected 'from' date
  toDate: Date | null = null;    // Variable to store the selected 'to' date
  rowActionMenu: MenuItem[] = [
     { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
  ];
  dataItemSelected: Receipt | undefined;
  selectedRowIndex: number = -1;
  entityType: string[] = ['Customer' , 'Vendor'];  // Array to hold device types
  entityTypeSelected: string = 'Customer';  // Variable to hold the selected device type
  constructor(private apiService: ApiService,public appService: AppService) { }

  ngOnInit(): void {
    this.customerTypes = this.appService.masterData.customerType;
    this.customer = this.appService.masterData.entityMap.Customer;
   this.receiptLocation = this.appService.masterData.receiptLocation; 
    
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
    let custTypeID =null;
    let custVendorID=null;
    let behalfOfCustomerID=null;
    let receivingFacilityID=null;

    custTypeID=this.customerTypeSelected?.customerTypeID;
    custVendorID=this.customerSelected?.CustomerID;
     // Pass Date objects directly
     const from_date = this.fromDate ?? undefined;
     const to_date = this.toDate ?? undefined;
    if(this.customerTypeSelected?.customerTypeName =='Vendor')
    {
      // need to change logic
      // custVendorID=this.customerSelected?.VendorID;
      // behalfOfCustomerID=this.behalfOfCusotmerSelected?.VendorID;
      behalfOfCustomerID = 1;// temp fix
    }
    else
    {
      custVendorID=this.customerSelected?.CustomerID;
      behalfOfCustomerID=this.behalfOfCusotmerSelected?.CustomerID;
    }
    receivingFacilityID = this.receiptLocationSelected?.receivingFacilityID;
    this.apiService.getinventorydata(custVendorID,from_date,to_date).subscribe({
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
    this.pageSize = event.take; 
    console.log(event);
   // this.loadGridData();
  }

  onLinkClick(field: string, dataItem: any) 
  {
    if (field === 'receiptID')
    {
      console.log(dataItem.receiptID)

      this.apiService.getReceiptdata().subscribe({
        next: (v: any) => {
          this.receipts=v;
          this.appService.sharedData.receiving.dataItem = this.receipts.find(c => c.receiptID ==dataItem.receiptID);
          this.appService.sharedData.receiving.isEditMode = false;
          this.appService.sharedData.receiving.isViewMode = true;
          this.isDialogOpen3 = !this.isDialogOpen3;
        },
        error: (v: any) => { }
      });

    }

  }

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
  onSelectRowActionMenu(e: ContextMenuSelectEvent)
   {

  }
  rowCallback = (context: any) => {
    return {
      'highlighted-row': context.index === this.selectedRowIndex
    };
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
/*   onCellClick(event: any): void {
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
  } */
}
