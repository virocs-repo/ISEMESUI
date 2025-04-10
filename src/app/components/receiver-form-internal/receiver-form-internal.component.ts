import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Receipt, ICON, MESSAGES, Customer, ReceiptLocation, DeviceFamily, ReceiptStatus, ServiceCategory } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-receiver-form-internal',
  templateUrl: './receiver-form-internal.component.html',
  styleUrls: ['./receiver-form-internal.component.scss']
})
export class ReceiverFormInternalComponent implements OnDestroy {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  public isExpected: boolean | null = null;
  selectedReceivingInfoNum : string | null ="";
  customerId : number | undefined;
  deviceFamilyId : number | undefined;
  customerLotsStr : string | null = "";
  statusId : number | undefined;
  isElot : string | null = "";
  serviceCategoryId : number | undefined;
  locationId : number | undefined;
  from_Date: Date | undefined;
  to_Date: Date | undefined;
  receiptStatus:string | undefined;
  selectedLocation: ReceiptLocation[] = [];
  selectedStatus: ReceiptStatus[] = [];
  selectedServiceCategory:ServiceCategory | undefined;
  facilityIdStr: string | undefined;
  selectedreceivingInfo : string | null = "";
  customer: Customer[] = this.appService.masterData.entityMap.Customer;
  deviceFamily: DeviceFamily[] = this.appService.masterData.deviceFamily;
  location: ReceiptLocation[] = this.appService.masterData.receiptLocation;
  status: ReceiptStatus[] = this.appService.masterData.receiptStatus;
  serviceCategory: ServiceCategory[] = this.appService.masterData.serviceCategory;
  selectedDeviceFamily : DeviceFamily | undefined;
  selectedCustomer: Customer | undefined;
  selectedDevice:string | null ="";
  selectedCustomerLot:string | null ="";
  selectedIseLot:string | null ="";
  selectedMailNumber: string | null = "";
  receivingFacilityName : string = this.appService.facility;
  readonly ICON = ICON;
  public pageSize = 25;
  public skip = 0;
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  originalData: any[] = [];
  public searchTerm: string = '';
  isAddButtonEnabled: boolean = true;
  isEditButtonEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Edit")?.active ?? true;
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
  private readonly today = new Date();
  private readonly oneMonthAgo = new Date(this.today.getFullYear(), this.today.getMonth() - 1, this.today.getDate());
  range = {
    start: this.oneMonthAgo,
    end: this.today
  };
  format: string = 'yyyy-MM-dd';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
    this.fetchdata(); 
    this.appService.eventEmitter.emit({ action: 'refreshVendors', data: { m: 'masterData' } })
  }
  readonly subscription = new Subscription()

  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    const defaultStatus = this.appService.masterData.receiptStatus.find(
      status => status.itemText === 'Pending Receive'
    );
    if (defaultStatus) {
      this.selectedStatus = [defaultStatus];
    }
  
    this.isExpected = true;
    this.location = this.appService.masterData.receiptLocation;
    this.search();
    this.subscription.add(this.appService.sharedData.receiving.eventEmitter.subscribe((v) => {
      switch (v) {
        case 'closeDialog':
          this.closeDialog();
          break;
        default:
          break;
      }
    }));

    this.initRoleBasedUI();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private initRoleBasedUI() {
    const appMenu = this.appService.userPreferences?.roles.appMenus.find(am => am.menuTitle == 'Receiving Menu')
    if (appMenu) {
      this.appService.userPreferences?.roles.appFeatures.forEach(af => {
        switch (af.featureName) {
          case "Receiving Add":
            this.isAddButtonEnabled = af.active;
            break;
          case "Receiving Edit":
            var ed = this.rowActionMenu.find(r => r.text == 'Edit Data');
            if (ed) {
              ed.disabled = !af.active;
            }
            break;
          case "Receiving View":
            var ed = this.rowActionMenu.find(r => r.text == 'View Data');
            if (ed) {
              ed.disabled = !af.active;
            }
            break;
          case "Receiving Void":
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
  isSelected(receivingFacilityID: any): boolean {
    return this.selectedLocation.some(facility => facility.receivingFacilityID === receivingFacilityID);
  } 
  isSelectedStatus(masterListItemId: any): boolean {
    return this.selectedStatus.some(facility => facility.masterListItemId === masterListItemId);
  }  
  toggleSelection(item: any, type: string): void {
    if (type === 'status') {
      const index = this.selectedStatus.findIndex(facility => facility.masterListItemId === item.masterListItemId);
      if (index > -1) {
        this.selectedStatus.splice(index, 1);
      } else {
        this.selectedStatus.push(item); // Store full object to maintain reference
      }
    }
  }
  tagDisplayLimit(tags: any[]): any[] {
    const maxVisibleTags = 1;
    return tags.length > maxVisibleTags
      ? [...tags.slice(0, maxVisibleTags), { receivingFacilityName: `+${tags.length - maxVisibleTags} ` }]
      : tags;
  }
  tagDisplayLimits(tags: any[]): any[] {
    const maxVisibleTags = 1;
    return tags.length > maxVisibleTags
      ? [...tags.slice(0, maxVisibleTags),{ itemText: `+${tags.length - maxVisibleTags} ` }]
      : tags;
  }  
  private fetchdata() {
    const satatusIDs = this.selectedStatus
        .map(name => this.appService.masterData.receiptStatus.find(status => status.itemText === name.itemText)?.masterListItemId)
        .filter(id => id !== null);
        const statusIDsStr: string | null = 
        satatusIDs.length > 0 && this.isSearchClicked
            ? satatusIDs.join(',')
            : null;   
    this.apiService.getReceiverFormInternal(statusIDsStr,this.isExpected,this.from_Date,this.to_Date).subscribe({
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
  private testReceiptEdit() {
    setTimeout(() => {
      this.appService.sharedData.receiving.dataItem = this.gridDataResult.data[0]
      this.appService.sharedData.receiving.isEditMode = true;
      this.appService.sharedData.receiving.isViewMode = false;
      this.openDialog()
    }, 3000);
  }
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.fetchdata();
  }
  rowActionMenu: MenuItem[] = [
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Edit Data', icon: 'edit', disabled: !this.isEditButtonEnabled, svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
  ];
  dataItemSelected: Receipt | undefined;
  selectedRowIndex: number = -1;
  onCellClick(e: CellClickEvent): void {
    if (e.type === 'contextmenu') {
      this.showContextMenu(e);
    } else {
      if (e.type == 'click') {
        if (['Mac', 'iOS'].includes(this.appService.deviceDetectorService.os)) {
          this.showContextMenu(e);
        }
      }
    }
  }
  private showContextMenu(e: CellClickEvent) {
    const originalEvent = e.originalEvent;
    originalEvent.preventDefault();
    this.dataItemSelected = e.dataItem;
    this.selectedRowIndex = e.rowIndex;
    this.gridContextMenu.show({ left: originalEvent.pageX, top: originalEvent.pageY });
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent) {
    const dataItem = this.dataItemSelected;
    if (!dataItem) {
      console.error('Selected dataItem is not set');
      return;
    }
    dataItem.holdComments = dataItem.holdComments || '';
    switch (e.item.text) {
      case 'Void Data':
        this.apiService.voidReceipt(dataItem.receiptID, !dataItem.active).subscribe({
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
        this.appService.sharedData.receiving.dataItem = dataItem
        this.appService.sharedData.receiving.isEditMode = false;
        this.appService.sharedData.receiving.isViewMode = true;
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.receiving.dataItem = dataItem
        this.appService.sharedData.receiving.isEditMode = true;
        this.appService.sharedData.receiving.isViewMode = false;
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
  onClearForm() {
    this.isDialogOpen = false;
    setTimeout(() => {
      this.isDialogOpen = true;
    }, 300);
  }
  canCloseDialog() {
    this.appService.sharedData.receiving.eventEmitter.emit('canCloseDialog?')
  }
  private isSearchClicked = false; 
  search() {
    this.isSearchClicked = true; 
    this.fetchdata()
  }

  onSearchMaster(): void {
    this.skip = 0;
    this.pageData();
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
