import { Component, OnInit, ViewChild } from '@angular/core';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { Customer, CustomerType, EntityType, ICON } from 'src/app/services/app.interface';
import { eyeIcon, folderIcon, pencilIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { ApiService } from 'src/app/services/api.service';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AppService } from 'src/app/services/app.service';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent  implements OnInit {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  readonly ICON = ICON
  public pageSize = 10;
  public skip = 0;
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  selectedRowIndex: number = -1;
  customerTypes: CustomerType[] = [];
  lotNumber: string | null = null;  // Lot number
  lotNumbers: string[] = [];
  allLotNumbers: string[] = [];
  deviceTypes: string[] = ['Device', 'Hardware','Miscellaneous Goods','All']; 
  deviceTypeSelected: string = 'All';  // Variable to hold the selected device type
  customerTypeSelected: CustomerType | undefined;

  customer: Customer[] = []
  customerSelected: Customer | undefined;
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
  rowActionMenu: MenuItem[] = [
     { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
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
  constructor(private apiService: ApiService,public appService: AppService) { }

  ngOnInit(): void {
    this.customerTypes = this.appService.masterData.customerType;
    this.customer = this.appService.masterData.entityMap.Customer;
    this.loadGridData();
    this.getLotNumbers();
   

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
  onChangeCustomerType() {
    console.log(this.customerTypeSelected)
    console.log(this)
    
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
  loadGridData() {

    this.apiService.getallinventoryreportdata().subscribe({
      next: (v: any) => {
        this.gridDataResult.data = v;
        this.gridDataResult.total = v.length

      },
      error: (v: any) => { }
    });
  }
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    console.log(event);
    this.loadGridData();
  }
  onCellClick(e: CellClickEvent): void {
    console.log(e);
    if (e.type === 'contextmenu') {
      const originalEvent = e.originalEvent;
      originalEvent.preventDefault();
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
  isDialogOpen1 = false;
  isDialogOpen2 = false;

  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }
}
