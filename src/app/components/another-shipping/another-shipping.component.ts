import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { KeyValueData, Employee, Customer, CustomerType, ICON, Receipt } from 'src/app/services/app.interface';
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
  public pageSize = 25;
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

  constructor(public appService: AppService, private apiService: ApiService, public datePipe: DatePipe) { 
    debugger;
    this.fromDate = new Date();
    this.fromDate.setMonth(this.fromDate.getMonth() - 2);
    this.toDate = new Date();
    this.fetchdata();
    this.getOtherInventoryShipment(2);

  }

  ngOnInit(): void {
    this.init()
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

  fetchdata() {
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
    statusId = this.statusSelected.Id;
  }
  this.apiService.getOtherShippingData(customerId, employeeId, statusId, this.fromDate, this.toDate).subscribe({
    next: (v: any) => {
      this.gridDataResult.data = v;
      this.gridDataResult.total = v.length
      for (let index = 0; index < this.gridDataResult.data.length; index++) {
        const element = this.gridDataResult.data[index];
      }
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
    this.isDialogOpen = false;
  }

  doTestEditMode() {
    // this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.gridData[0]);
  }

  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  rowActionMenu: MenuItem[] = [
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
  ];
  dataItemSelected!: Receipt;
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
    console.log(e);
    console.log(dataItem);
    dataItem.holdComments = dataItem.holdComments || '';
    switch (e.item.text) {
      case 'View Data':
        this.appService.sharedData.shipping.dataItem = dataItem
        this.appService.sharedData.shipping.isEditMode = false;
        this.appService.sharedData.shipping.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.shipping.dataItem = dataItem
        this.appService.sharedData.shipping.isEditMode = true;
        this.appService.sharedData.shipping.isViewMode = false;
        // access the same in receipt component
        this.openDialog()
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
  populateStatusCombo()
  {
    debugger;
    this.apiService.getOtherInventoryStatuses().subscribe({
      next: (data:any) => {
        debugger;
        this.statuses = data;
      },
      error : (e:any) => {}
    })
  }

  getOtherInventoryShipment(otherInventoryId:number)  {
    debugger;
    this.apiService.getOtherInventoryShipment(otherInventoryId).subscribe({
      next: (data:any) => {
        debugger;
      }
    })
  }
}