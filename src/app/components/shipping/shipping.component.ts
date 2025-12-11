import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CustomerType, ICON, Receipt } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss'],
  standalone: false
})
export class ShippingComponent implements OnDestroy {
  readonly ICON = ICON;
  gridDataResult: GridDataResult = { data: [], total: 0 };
  public pageSize = 25;
  public skip = 0;
  readonly customerTypes: CustomerType[] = this.appService.masterData.customerType;
  readonly subscription = new Subscription();
  private readonly today = new Date();
  private readonly oneMonthAgo = new Date(this.today.getFullYear(), this.today.getMonth() - 1, this.today.getDate());
  range = {
    start: this.oneMonthAgo,
    end: this.today
  };
  format: string = 'yyyy-MM-dd'; // Date format for kendo-datetimepicker
  fromDate: Date | null = null;  // Variable to store the selected 'from' date
  toDate: Date | null = null;    // Variable to store the selected 'to' date
  // fromDate = '';
  // toDate = '';
  public searchTerm: string = '';
  private originalData: any[] = [];

  dialogType: 'viewEdit' | 'add' | null = null; 


  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchdata();
    this.subscription.add(this.appService.eventEmitter.subscribe(e => {
      if (e.action == 'updates') {
        this.init()
      }
    }))
    this.initRoleBasedUI()
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  isAddButtonEnabled = true;
  private initRoleBasedUI() {
    const appMenu = this.appService.userPreferences?.roles.appMenus.find(am => am.menuTitle == "Shipping Menu")
    if (appMenu) {
      this.appService.userPreferences?.roles.appFeatures.forEach(af => {
        switch (af.featureName) {
          case "Shipping Add":
            this.isAddButtonEnabled = af.active
            break;
          case "Shipping Edit":
            var ed = this.rowActionMenu.find(r => r.text == 'Edit Data');
            if (ed) {
              ed.disabled = !af.active;
            }
            break;
          case "Shipping View":
            var ed = this.rowActionMenu.find(r => r.text == 'View Data');
            if (ed) {
              ed.disabled = !af.active;
            }
            break;
          case "Shipping Void":
            var ed = this.rowActionMenu.find(r => r.text == 'Void Data');
            if (ed) {
              ed.disabled = !af.active;
            }
            break;
          default:
            break;
        }
      })
    }
  }
  private init() {
    this.customerTypes.length = 0;
    this.customerTypes.push(...this.appService.masterData.customerType)
  }
  private fetchdata() {
    
    this.apiService.getShippingData(this.fromDate, this.toDate).subscribe({
      next: (v: any) => {
        /*      this.gridDataResult.data = v;
             this.gridDataResult.total = v.length */
      
        this.originalData = v;
        this.pageData();

        for (let index = 0; index < this.gridDataResult.data.length; index++) {

          const element = this.gridDataResult.data[index];
          element.customerTypeSelected = this.customerTypes.find(c => c.customerTypeID == element.customerID);
          element.shipped = element.isShipped == true ? 'Yes' : 'No';
        }
      },
      error: (v: any) => { }
    });
    if (this.appService.shipmentCategories.length) {
    } else {
      this.apiService.getShipmentCategories().subscribe({
        next: (shipmentCategories: any) => {
          this.appService.shipmentCategories = shipmentCategories;
          console.log({ shipmentCategories });
        },
        error: (v: any) => { }
      })
    }
    if (this.appService.shipmentTypes.length) {
    } else {
      this.apiService.getShipmentTypes().subscribe({
        next: (shipmentTypes: any) => {
          this.appService.shipmentTypes = shipmentTypes;
          console.log({ shipmentTypes });
        },
        error: (v: any) => { }
      })
    }
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
  isDialogAddOpen = false;
  openDialog(type: 'viewEdit' | 'add', isEditMode: boolean = false): void {
    this.isDialogOpen = true;
    this.isDialogAddOpen=true;
    this.dialogType = type;

    if (type === 'viewEdit') {
      this.appService.sharedData.shipping = {
        ...this.appService.sharedData.shipping,
        dataItem: this.dataItemSelected,
        isViewMode: !isEditMode,
        isEditMode: isEditMode
      };
    }
  }

  // Close dialog
  closeDialog(): void {
    this.isDialogOpen = false;
    this.dialogType = null;
    this.fetchdata(); // Refresh data after closing the dialog
  }

  closeDialgadd():void{
    this.isDialogAddOpen=false;
    this.dialogType = null;
    this.fetchdata(); 
  }
  closeDialogAddParent():void{
   
    
    this.isDialogAddOpen=false;
    this.dialogType ='viewEdit' ;
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
        //this.openDialog()
        this.openDialog('viewEdit', false);
        break;
      case 'Edit Data':
        this.appService.sharedData.shipping.dataItem = dataItem
        this.appService.sharedData.shipping.isEditMode = true;
        this.appService.sharedData.shipping.isViewMode = false;
        // access the same in receipt component
        //this.openDialog()
        this.openDialog('viewEdit', true);
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
  onAddShipping(): void {
    this.openDialog('add'); // Open add shipping dialog
  }
  search() {
    // this.fromDate = moment(this.range.start).format('MM-DD-YYYY');
    // this.toDate = moment(this.range.end).format('MM-DD-YYYY');
    this.fetchdata()
  }

  onSearchMaster(): void {
    this.skip = 0;  // Reset pagination when searching
    this.pageData();  // Apply search and pagination
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
}
