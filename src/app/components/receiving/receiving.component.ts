import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Receipt, ICON, MESSAGES, ReceiptLocation } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'app-receiving',
  templateUrl: './receiving.component.html',
  styleUrls: ['./receiving.component.scss'],
  standalone: false
})
export class ReceivingComponent implements OnDestroy {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;

  readonly ICON = ICON;
  public pageSize = 25;
  public skip = 0;
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  originalData: any[] = [];
  public searchTerm: string = '';
  isAddButtonEnabled: boolean = true;
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  readonly filterSettings: DropDownFilterSettings = {
        caseSensitive: false,
        operator: 'contains'
      };
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
    setTimeout(() => {
      this.receiptLocationSelected = this.appService.masterData.receiptLocation.find(
        e => e.receivingFacilityName === this.appService.facility
      );
      this.appService.masterData.receiptLocation.forEach(e =>{
        if(e.receivingFacilityName === this.appService.facility)
        {
          this.selectedFacilities.push(e);
        }
      })
      this.search();
    }, 500);
    
    this.subscription.add(this.appService.sharedData.receiving.eventEmitter.subscribe((v) => {
      if (v === 'closeDialog') {
        this.closeDialog();
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

  public areaList: Array<string> = [ 
    "Pending Receive",
    "Received",
  ];
  public selectedFacilities: ReceiptLocation[] = [];
  public selectedReceiptStatuses: string[] = ["Pending Receive"];
  isSelectedFacility(receivingFacilityID: any): boolean {
    return this.selectedFacilities.some(facility => facility.receivingFacilityID === receivingFacilityID);
  }  
  toggleSelection(item: any, type: string): void {
    if (type === 'facility') {
      const index = this.selectedFacilities.findIndex(facility => facility.receivingFacilityID === item.receivingFacilityID);
      if (index > -1) {
        this.selectedFacilities.splice(index, 1);
      } else {
        this.selectedFacilities.push(item); // Store full object to maintain reference
      }
    } else if (type === 'receipt') {
      const index = this.selectedReceiptStatuses.indexOf(item);
      if (index > -1) {
        this.selectedReceiptStatuses.splice(index, 1);
      } else {
        this.selectedReceiptStatuses.push(item);
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
      ? [...tags.slice(0, maxVisibleTags), `+${tags.length - maxVisibleTags}`]
      : tags;
  }  
  private fetchdata(): void {
    // Convert facility names to IDs
    const facilityIDs = this.selectedFacilities
        .map(name => this.appService.masterData.receiptLocation.find(facility => facility.receivingFacilityName === name.receivingFacilityName)?.receivingFacilityID)
        .filter(id => id !== undefined); // Filter out undefined values in case no match is found

    const facilityIDsStr = facilityIDs.length > 0 && this.isSearchClicked
        ? facilityIDs.join(',')
        : null;

    const receiptStatus = this.selectedReceiptStatuses.length > 0 && this.isSearchClicked
        ? this.selectedReceiptStatuses.join(',')
        : null;

    this.apiService.getReceiptdatas(facilityIDsStr, receiptStatus, this.fromDate, this.toDate).subscribe({
      next: (response: any) => {
        this.originalData = response;
        this.pageData();
      },
      error: (error: any) => {
        console.error("Error fetching data:", error);
      }
    });
}
  private testReceiptEdit() {
    setTimeout(() => {
      this.appService.sharedData.receiving.dataItem = this.gridDataResult.data[0]
      this.appService.sharedData.receiving.isEditMode = true;
      this.appService.sharedData.receiving.isViewMode = false;
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
        this.appService.sharedData.receiving.dataItem = dataItem
        this.appService.sharedData.receiving.isEditMode = false;
        this.appService.sharedData.receiving.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.receiving.dataItem = dataItem
        this.appService.sharedData.receiving.isEditMode = true;
        this.appService.sharedData.receiving.isViewMode = false;
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
        if (['Mac', 'iOS'].includes(this.appService.deviceDetectorService.getDeviceInfo().os)) {
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
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.checkIfEditable(dataItem);
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
  
  private isSearchClicked = false; // Track search button click

  search() {
    this.isSearchClicked = true; // Only apply filtering when search is clicked
    this.fetchdata();
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
        (this.selectedReceiptStatuses.length === 0 || this.selectedReceiptStatuses.includes(item.receiptStatus)) &&
        Object.values(item).some(val => String(val).toLowerCase().includes(term))
    );
  }

  private checkIfEditable(dataItem: Receipt): void {
    this.apiService.checkingIsReceiptEditable(dataItem.receiptID, this.appService.loginId).subscribe({
      next: (response: any) => {
        if (response === 1) {
          this.appService.sharedData.receiving.dataItem = dataItem
          this.appService.sharedData.receiving.isEditMode = true;
          this.appService.sharedData.receiving.isViewMode = false;
          this.openDialog()
        } else {
        this.appService.errorMessage('Editing is not allowed for this receipt.');
        }
      },
      error: (err: any) => {
        this.appService.errorMessage('Failed to check edit permissions.'); 
      },
    });
  }
}
