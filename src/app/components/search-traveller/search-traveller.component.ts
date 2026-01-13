import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Receipt, ICON, MESSAGES, ReceiptLocation, Travellerlist, Traveller } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
    selector: 'app-search-traveller',
    templateUrl: './search-traveller.component.html',
    styleUrls: ['./search-traveller.component.scss'],
    standalone: false
})
export class SearchTravellerComponent implements OnDestroy {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;

  readonly subscription = new Subscription()
  readonly ICON = ICON;
  isDialogOpen = false;

  public pageSize = 25;
  public skip = 0;
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  public originalData: any[] = [];

  public searchTerm: string = '';
  public isAddButtonEnabled: boolean = true;
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  
  isEditButtonEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Edit")?.active ?? true;
  
  private readonly today = new Date();
  private readonly oneMonthAgo = new Date(this.today.getFullYear(), this.today.getMonth() - 1, this.today.getDate());
  range = {
    start: this.oneMonthAgo,
    end: this.today
  };
  format: string = 'yyyy-MM-dd'; 
  fromDate: Date | null = null;  
  toDate: Date | null = null;
  
  dataItemSelected: Traveller | undefined;
  selectedRowIndex: number = -1;

  public travellerStatuses: Travellerlist[] = this.appService.masterData.Travellerlist;
  public lotStatuses: any[] = [];
  public selectedLotStatuses: any[] = [];
  public selectedTravellerStatuses: Travellerlist[] = [];
  
  readonly filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
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

  rowActionMenu: MenuItem[] = [
    { text: 'Edit Data', icon: 'edit', disabled: !this.isEditButtonEnabled, svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
  ];

  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void { 
    this.init();
    setTimeout(() => {
      this.search();
    }, 500);
    
    this.subscription.add(this.appService.sharedData.traveller.eventEmitter.subscribe((v) => {
      if (v === 'closeDialog') {
        this.closeDialog();
      }
    }));

    // this.initRoleBasedUI();
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

  init() {
    this.getLotStatuses();
  }

  getLotStatuses(){
    this.apiService.getLotStatuses().subscribe({
      next: (data:any) => {
        this.lotStatuses = data;
      },
      error: (err:any) => {

      }
    });
  }

  private searchData(): void {
    const lotStatusIDsList = this.selectedLotStatuses
        .map(selected => this.lotStatuses.find(lotStatus => lotStatus.masterListItemId === selected.masterListItemId)?.masterListItemId)
        .filter(id => id !== undefined); // Filter out undefined values in case no match is found
    const lotStatusIDsStr = lotStatusIDsList.length > 0 ? lotStatusIDsList.join(',') : null;

    this.apiService.searchLots(null, lotStatusIDsStr, this.fromDate, this.toDate).subscribe({
      next: (data: any) => {
        this.originalData = data;
        this.pageData();
      },
      error: (error: any) => {
        console.error("Error fetching data:", error);
      }
    });
  }
  
  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.searchData();
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
            this.searchData()
          },
          error: (err) => {
            this.appService.errorMessage(MESSAGES.DataSaveError);
          },
        })
        break;
      case 'View Data':
        this.appService.sharedData.traveller.dataItem = dataItem
        this.appService.sharedData.traveller.isEditMode = false;
        this.appService.sharedData.traveller.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.traveller.dataItem = dataItem
        this.appService.sharedData.traveller.isEditMode = true;
        this.appService.sharedData.traveller.isViewMode = false;
        // access the same in receipt component
        this.openDialog()
        break;

      default:
        break;
    }
  }
  
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
    switch (e.item.text) {
      case 'View Data':
        this.appService.sharedData.traveller.dataItem = dataItem
        this.appService.sharedData.traveller.isEditMode = false;
        this.appService.sharedData.traveller.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.traveller.dataItem = dataItem
        this.appService.sharedData.traveller.isEditMode = true;
        this.appService.sharedData.traveller.isViewMode = false;
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
    this.isDialogOpen = false;
    this.appService.sharedData.traveller.eventEmitter.emit('canCloseDialog?')
  }
  
  search() {
    this.searchData();
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
      (this.selectedTravellerStatuses?.length === 0 ||
       this.selectedTravellerStatuses?.some(status => status.masterListItemId === item.receiptStatus)) &&
      Object.values(item).some(val => String(val).toLowerCase().includes(term))
    );
  }

  private checkIfEditable(dataItem: Receipt): void {
    this.apiService.checkingIsReceiptEditable(dataItem.receiptID, this.appService.loginId).subscribe({
      next: (response: any) => {
        if (response === 1) {
          this.appService.sharedData.traveller.dataItem = dataItem
          this.appService.sharedData.traveller.isEditMode = true;
          this.appService.sharedData.traveller.isViewMode = false;
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
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {    
    this.isDialogOpen = false;
    this.searchData(); 
    this.appService.eventEmitter.emit({ action: 'refreshVendors', data: { m: 'masterData' } })
  }
}
