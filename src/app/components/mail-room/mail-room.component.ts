import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Receipt, ICON, MESSAGES, Customer, KeyValueData, ReceiptLocation, DeliveryMode } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'app-mail-room',
  templateUrl: './mail-room.component.html',
  styleUrls: ['./mail-room.component.scss'],
  standalone: false
})
export class MailRoomComponent implements OnDestroy {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;

  readonly ICON = ICON;
  public pageSize = 25;
  public skip = 0;
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  originalData: any[] = [];
  public searchTerm: string = ''; 
  customer: Customer[] =[];
  customerSelected: Customer | undefined;
  deliveryMode: DeliveryMode[] = this.appService.masterData.deliveryMode;
  deliveryModeSelected: DeliveryMode | undefined;
  location: ReceiptLocation[] = this.appService.masterData.receiptLocation
  locationSelected: ReceiptLocation | undefined;
  statusList: any[] = [];
  devicefamilyList:any[] = [];
  deviceList:any[] = [];
  mailSearch:string | undefined;
  devicefamilySelected:any = null;
  deviceSelected:any | undefined;
  selectedStatus:any = null;
  trackingNo:string | undefined;
  customerLot:string | undefined;
  receivingNumber:string | undefined;
  lotNumber:string | undefined; 
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
  // fromDate = '';
  // toDate = '';
  format: string = 'yyyy-MM-dd'; // Date format for kendo-datetimepicker
  fromDate: Date | null = null;  // Variable to store the selected 'from' date
  toDate: Date | null = null;    // Variable to store the selected 'to' date
  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  openAddDialog(){
    this.appService.sharedData.mailRoom.dataItem = null;
    this.appService.sharedData.mailRoom.isEditMode = false;
    this.appService.sharedData.mailRoom.isViewMode = false;
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
    this.fetchdata(); // because there might be changes from dialog
    this.appService.eventEmitter.emit({ action: 'refreshVendors', data: { m: 'masterData' } })
  }
  readonly subscription = new Subscription()

  constructor(public appService: AppService, private apiService: ApiService) { }
 

  async ngOnInit(): Promise<void> {
    setTimeout(() => {
      this.customer = this.appService.masterData.entityMap.Customer;
      this.deliveryMode= this.appService.masterData.deliveryMode;
      this.location = this.appService.masterData.receiptLocation;
       this.getStatusList('MailRoomStatus');
      this.search();
      this.subscription.add(this.appService.sharedData.mailRoom.eventEmitter.subscribe((v) => {
        switch (v) {
          case 'closeDialog':
            this.closeDialog();
            break;
          default:
            break;
        }
      }));
    }, 500);
    this.initRoleBasedUI();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  async getStatusList(listName: string){
    this.statusList = await new Promise<any>((resolve, reject) => { 
      this.apiService.getStatusList(listName).subscribe({
        next:(data) => resolve(data),
        error: (err) => reject(err)
        
       });
    });
  }
  onCustomerChange(selectedCustomer: any) {
    if (!selectedCustomer && !selectedCustomer.CustomerID) return;
  
    const customerId = selectedCustomer.CustomerID;
    this.getDeviceFamiliesList(customerId);
  }

  getDeviceFamiliesList(customerId: number) {
    this.apiService.getDeviceFamiliesList(customerId).subscribe({
      next: (data: any[]) => { 
        this.devicefamilyList = Array.isArray(data) ? data : []; 
      },
      error: (err) => {
        console.error('Error fetching device families:', err);
        this.devicefamilyList = [];
      }
    });
  }
  onDeviceFamilyChange(selectedDeviceFamily: any) {
    const customerId = this.customerSelected?.CustomerID; 
    if (customerId && selectedDeviceFamily) {
      this.getDeviceList(customerId, selectedDeviceFamily.deviceFamilyId);
    } else {
      this.deviceList = []; 
    }
  }
  

  getDeviceList(customerId: number, deviceFamilyId: number) {
    this.apiService.getDeviceList(customerId, deviceFamilyId).subscribe(
      (data: any[]) => {
        this.deviceList = Array.isArray(data) ? data : []; 
      },
      (error) => {
        console.error('Error fetching device list:', error);
        this.deviceList = []; 
      }
    );
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

  isStatusSelected(id: number): boolean {
    return this.selectedStatus?.some((item: any) => item.masterListItemId === id);
  }
  
  toggleStatusSelection(item: any): void {
    const index = this.selectedStatus.findIndex((x: any) => x === item.masterListItemId);
    if (index >= 0) {
      this.selectedStatus.splice(index, 1);
    } else {
      this.selectedStatus.push(item.masterListItemId);
    }
    this.selectedStatus = [...this.selectedStatus]; 
  }
  
  statusTagDisplayLimit = (tags: any[]): any[] => {
    const maxVisibleTags = 2;
    return tags.length > maxVisibleTags
      ? [...tags.slice(0, maxVisibleTags), { masterListItemId: 0, itemText: `+${tags.length - maxVisibleTags}` }]
      : tags;
  };

  private fetchdata() {
    const statusString = this.selectedStatus?.length? this.selectedStatus.map((x: any) => x.masterListItemId).join(','): null;    
    this.apiService.getSearchMailRoomReceiptData(statusString,this.fromDate,this.toDate).subscribe({
      next: (v: any) => {
        this.originalData = v;
        this.pageData();
      },
      error: (v: any) => { }
    });
  }
  private testReceiptEdit() {
    setTimeout(() => {
      this.appService.sharedData.mailRoom.dataItem = this.gridDataResult.data[0]
      this.appService.sharedData.mailRoom.isEditMode = true;
      this.appService.sharedData.mailRoom.isViewMode = false;
      // access the same in receipt component
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
    // { text: 'Export Data', icon: 'export', svgIcon: ICON.exportIcon }
  ];
  doTestEditMode() {
    // this.onSelectRowActionMenuV1({ item: { text: 'Edit Data' } } as any, this.gridDataResult.data[0]);
  }
  private onSelectRowActionMenuV1(e: ContextMenuSelectEvent, dataItem: Receipt) {
    dataItem.holdComments = dataItem.holdComments || '';
    switch (e.item.text) {
      case 'Void Data':
        const body = {
          receiptDetails: [
            { ...dataItem, recordStatus: "U", loginId: this.appService.loginId, active: false }
          ]
        };
        // temp fix
        if (body.receiptDetails[0].receivingStutus) {
          body.receiptDetails[0].receivingStatus = body.receiptDetails[0].receivingStutus;
        }
        this.apiService.postProcessReceipt(body).subscribe({
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
        this.appService.sharedData.mailRoom.dataItem = dataItem
        this.appService.sharedData.mailRoom.isEditMode = false;
        this.appService.sharedData.mailRoom.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.mailRoom.dataItem = dataItem
        this.appService.sharedData.mailRoom.isEditMode = true;
        this.appService.sharedData.mailRoom.isViewMode = false;
        // access the same in receipt component
        this.openDialog()
        break;

      default:
        break;
    }

  }
  dataItemSelected: Receipt | undefined;
  selectedRowIndex: number = -1;
  onCellClick(e: CellClickEvent): void {
    if (e.type === 'contextmenu') {
      this.showContextMenu(e);
    } else {
      if (e.type == 'click') {
        if (['Mac', 'iOS'].includes(this.appService.deviceDetectorService.deviceInfo().os)) {
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
        this.appService.sharedData.mailRoom.dataItem = dataItem
        this.appService.sharedData.mailRoom.isEditMode = false;
        this.appService.sharedData.mailRoom.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.mailRoom.dataItem = dataItem
        this.appService.sharedData.mailRoom.isEditMode = true;
        this.appService.sharedData.mailRoom.isViewMode = false;
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
  onClearForm() {
    this.isDialogOpen = false;
    setTimeout(() => {
      this.isDialogOpen = true;
    }, 300);
  }
  canCloseDialog() {
    this.appService.sharedData.mailRoom.eventEmitter.emit('canCloseDialog?')
  }
  search() {
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
