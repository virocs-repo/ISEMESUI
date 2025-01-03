import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AnotherShip, MESSAGES, KeyValueData, Employee, Customer, CustomerType, ICON, Receipt } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-another-shipping',
  templateUrl: './another-shipping.component.html',
  styleUrls: ['./another-shipping.component.scss'],
  providers:[DatePipe]
})
export class AnotherShippingComponent implements OnDestroy {
  readonly ICON = ICON;
  gridDataResult: GridDataResult = { data: [], total: 0 };
  public pageSize = 10;
  public skip = 0;
  readonly subscription = new Subscription();
  format: string = 'yyyy-MM-dd'; // Date format for kendo-datetimepicker
  fromDate: Date | null = null;  // Variable to store the selected 'from' date
  toDate: Date | null = null;    // Variable to store the selected 'to' date
  readonly customers: Customer[] = [];//this.appService.masterData.entityMap.Customer;
  readonly employees: Employee[] = [];//this.appService.masterData.entityMap.Employee;
  statuses: KeyValueData[] = [];
  customerSelected: Customer | undefined;
  employeeSelected: Employee | undefined;
  statusSelected: KeyValueData | undefined;
  searchTerm:string="";
  originalData: any[] = [];
  
  constructor(public appService: AppService, private apiService: ApiService, public datePipe: DatePipe) { 
     
    this.fromDate = new Date();
    this.fromDate.setMonth(this.fromDate.getMonth() - 2);
    this.toDate = new Date();
    this.fetchdata();

  }

  ngOnInit(): void {
    this.init()
    this.subscription.add(this.appService.sharedData.anotherShipping.eventEmitter.subscribe((v) => {
      switch (v) {
        case 'closeDialog':
          this.closeDialog();
          break;
        default:
          break;
      }
    }));
    
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private init() {
    this.populateStatusCombo();
    if(this.customers.length == 0) {
      this.customers.push(...this.appService.masterData.entityMap.Customer)
    }
    if(this.employees.length == 0){
      this.employees.push(...this.appService.masterData.entityMap.Employee)
    }
  }
  canCloseDialog() {
    debugger;
    this.appService.sharedData.anotherShipping.eventEmitter.emit('canCloseDialog?')
  }
  fetchdata() {
    debugger;
  var customerId:number = 0;
  var employeeId:number = 0;
  var statusId:number = 0;
  if(this.customerSelected != null && this.customerSelected != undefined)
  {
    customerId = this.customerSelected.CustomerID;
  }
  if(this.employeeSelected != null && this.employeeSelected != undefined)
  {
    employeeId = this.employeeSelected.EmployeeID;
  }
  if(this.statusSelected != null && this.statusSelected != undefined)
  {
    statusId = this.statusSelected.id;
  }
  this.apiService.getOtherShippingData(customerId, employeeId, statusId, this.fromDate, this.toDate).subscribe({
    next: (v: any) => {
      this.originalData = v;
      this.pageData();
      // this.gridDataResult.data = v;
      // this.gridDataResult.total = v.length
      // for (let index = 0; index < this.gridDataResult.data.length; index++) {
      //   const element = this.gridDataResult.data[index];
      // }
    },
    error: (v: any) => { }
  });

    // if (this.appService.shipmentCategories.length) {
    // } else {
    //   this.apiService.getShipmentCategories().subscribe({
    //     next: (shipmentCategories: any) => {
    //       this.appService.shipmentCategories = shipmentCategories;
    //       console.log({ shipmentCategories });
    //     },
    //     error: (v: any) => { }
    //   })
    // }
    // if (this.appService.shipmentTypes.length) {
    // } else {
    //   this.apiService.getShipmentTypes().subscribe({
    //     next: (shipmentTypes: any) => {
    //       this.appService.shipmentTypes = shipmentTypes;
    //       console.log({ shipmentTypes });
    //     },
    //     error: (v: any) => { }
    //   })
    // }
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    console.log(event);
    this.fetchdata();
  }
  selectableSettings: SelectableSettings = {
    checkboxOnly: true,
    mode: 'multiple'
  }
  columnMenuSettings: ColumnMenuSettings = {
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
  closeDialog() {
    this.fetchdata();
    this.isDialogOpen = false;
  }

  doTestEditMode() {
    // this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.gridData[0]);
  }

  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  rowActionMenu: MenuItem[] = [
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
  ];
  dataItemSelected!: AnotherShip;
  selectedRowIndex: number = -1;
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
    switch (e.item.text) {
    case 'Void Data':
      this.apiService.voidAnotherShipping(dataItem.anotherShipmentID).subscribe({
        next: (value) => {
          this.appService.successMessage(MESSAGES.DataSaved);
          this.fetchdata()
        },
        error: (err) => {
          this.appService.errorMessage(MESSAGES.DataSaveError);
        },
      })
      break;
      case 'View Data':
        this.appService.sharedData.anotherShipping.dataItem = dataItem
        this.appService.sharedData.anotherShipping.isEditMode = false;
        this.appService.sharedData.anotherShipping.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.anotherShipping.dataItem = dataItem
        this.appService.sharedData.anotherShipping.isEditMode = true;
        this.appService.sharedData.anotherShipping.isViewMode = false;
        // access the same in receipt component
        this.openDialog()
        break;

      default:
        break;
    }
  }

  addAnotherShipment(){
     
    this.appService.sharedData.anotherShipping.dataItem = {};
    this.appService.sharedData.anotherShipping.isEditMode = false;
    this.appService.sharedData.anotherShipping.isViewMode = false;

    this.openDialog();
  }

  rowCallback = (context: any) => {
    return {
      'highlighted-row': context.index === this.selectedRowIndex
    };
  }
  populateStatusCombo()
  {
     
    this.apiService.getOtherInventoryStatuses().subscribe({
      next: (data:any) => {
         
        this.statuses = data;
      },
      error : (e:any) => {}
    })
  }
  onSearchMaster(): void {
    this.skip = 0;  // Reset pagination when searching
    this.pageData();  // Apply search and pagination
  }
  
  pageData(): void {
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
}