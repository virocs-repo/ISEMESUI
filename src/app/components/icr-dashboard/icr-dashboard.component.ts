import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Receipt, ICON, MESSAGES, ReceiptLocation, Travellerlist, Traveller, Customer, SplitPreviewHeader, PreviewHeaderResponse } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ExecuteSplitMergeComponent } from '../execute-split-merge/execute-split-merge.component';
@Component({
    selector: 'app-icr-dashboard',
    templateUrl: './icr-dashboard.component.html',
    styleUrls: ['./icr-dashboard.component.scss'],
    standalone: false
})
export class IcrDashboardComponent implements OnDestroy {

  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  @ViewChild(ExecuteSplitMergeComponent)
  childComponent!: ExecuteSplitMergeComponent;
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
  public requestTypes: any[] = [];
  public selectedLotStatuses: any[] = [];
  public selectedTravellerStatuses: Travellerlist[] = [];
  public selectedRequestTypes: any[] = [];
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
    
  ];

  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
  selectedTrvStepId:number = 0;
  isSplitDialogOpen:boolean = false;
  currentIndex = 0;
  currentRequestType:string = "";
  previewResponse!:PreviewHeaderResponse;
  constructor(public appService: AppService, private apiService: ApiService) { }
  
  ngOnInit(): void { 
    this.init();
    setTimeout(() => {
      this.search();
    }, 500);
    
    this.subscription.add(this.appService.sharedData.icrDashboard.eventEmitter.subscribe((v) => {
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
    this.getRequestTypes();
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
  getRequestTypes(){
    this.apiService.getRequestTypes().subscribe({
      next: (data:any) => {
        this.requestTypes = data;
      },
      error: (err:any) => {

      }
    });
  }
  private searchData(): void {
    let customerId =  this.customerSelected?.CustomerID;
    let trvStatusIds = this.selectedTravellerStatuses?.length > 0 ? this.selectedTravellerStatuses.map(t=>t.masterListItemId).join(',') : null;
    let requestTypeIds = this.selectedRequestTypes?.length > 0 ? this.selectedRequestTypes.map(t=>t.masterListItemId).join(',') : null;
    const lotStatusIDsStr = this.selectedLotStatuses.length > 0 ? this.selectedLotStatuses.map(t=>t.masterListItemId).join(',') : null;   

    this.apiService.icrDashboardsearch(customerId, trvStatusIds, lotStatusIDsStr, requestTypeIds, this.fromDate, this.toDate).subscribe({
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
          error: (err: any) => {
            this.appService.errorMessage(MESSAGES.DataSaveError);
          },
        })
        break;
      case 'View Data':
        this.appService.sharedData.icrDashboard.dataItem = dataItem
        this.appService.sharedData.icrDashboard.isEditMode = false;
        this.appService.sharedData.icrDashboard.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.icrDashboard.dataItem = dataItem
        this.appService.sharedData.icrDashboard.isEditMode = true;
        this.appService.sharedData.icrDashboard.isViewMode = false;
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
    this.rowActionMenu = [];
    if(e.dataItem.requestType == 'Merge'){      
        this.rowActionMenu.push({ text: 'Merge', icon: 'eye', svgIcon: ICON.eyeIcon });
      }else if(e.dataItem.requestType == 'Future Split'){      
        this.rowActionMenu.push({ text: 'Future Split', icon: 'eye', svgIcon: ICON.eyeIcon });
      }else if(e.dataItem.requestType == 'Split'){      
        this.rowActionMenu.push({ text: 'Split', icon: 'eye', svgIcon: ICON.eyeIcon });
      }
    this.gridContextMenu.show({ left: originalEvent.pageX, top: originalEvent.pageY });
  }
  onSelectRowActionMenu(e: ContextMenuSelectEvent) {
    const dataItem = this.dataItemSelected;
    if (!dataItem) {
      console.error('Selected dataItem is not set');
      return;
    }
    this.selectedTrvStepId = dataItem.trvStepId;
    this.currentIndex = 0;
    this.currentRequestType = '';
    switch (e.item.text) {
      case 'View Data':
        this.appService.sharedData.icrDashboard.dataItem = dataItem
        this.appService.sharedData.icrDashboard.isEditMode = false;
        this.appService.sharedData.icrDashboard.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Merge':
        this.appService.sharedData.icrDashboard.dataItem = dataItem
        this.appService.sharedData.icrDashboard.isEditMode = true;
        this.appService.sharedData.icrDashboard.isViewMode = false;
        this.currentRequestType = 'Merge';
        setTimeout(() => {
          
          this.childComponent.getMachedLotsToMerge(dataItem.trvStepId);
          this.childComponent.selectedLotId = dataItem.lotId;
        });
               
        this.openDialog()
        break;
      case "Future Split":
        this.currentRequestType = 'Future Split';
         this.appService.sharedData.icrDashboard.dataItem = dataItem;
          setTimeout(() => {
            this.getFSPreviewDetails(dataItem.trvStepId);
          });
          

         break;
      case "Split":
        this.currentRequestType = 'Split';
         setTimeout(() => {
            this.getSplitPreviewDetails(dataItem.trvStepId, dataItem.lotId);
          });
          
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
    this.appService.sharedData.icrDashboard.eventEmitter.emit('canCloseDialog?')
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
          this.appService.sharedData.icrDashboard.dataItem = dataItem
          this.appService.sharedData.icrDashboard.isEditMode = true;
          this.appService.sharedData.icrDashboard.isViewMode = false;
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

  getFSPreviewDetails(trvStepId: number){
     this.apiService.getFSPreviewDetails(trvStepId).subscribe({
        next: (response: any) => {
           this.previewResponse = response;
           this.openSplitDialog();
        },
        error: (err: any) => {
          alert(err.error);
          console.error('Error fetching future preview details', err);
        }
      });
  }
  getSplitPreviewDetails(trvStepId: number, lotId:number){
     this.apiService.getSplitPreviewDetails(trvStepId, lotId).subscribe({
        next: (response: any) => {
           this.previewResponse = response;
           this.openSplitDialog();
        },
        error: (err: any) => {
          alert(err.error);
          console.error('Error fetching future preview details', err);
        }
      });
  }

  finishFS(){
    if(this.currentRequestType == 'Future Split'){
     this.apiService.generateFutureSplit(this.selectedTrvStepId).subscribe({
        next: (response: any) => {
          if(response){
            alert(response);
            this.isSplitDialogOpen = false;
            this.search();
          }
        },
        error: (err: any) => {
          alert(err.error);
          console.error('Error fetching future preview details', err);
        }
      });
    }
    else if(this.currentRequestType == 'Split'){
      this.apiService.generateSplit(this.selectedTrvStepId,this.appService.loginId).subscribe({
        next: (response: any) => {
          if(response){
            alert(response);
            this.isSplitDialogOpen = false;
            this.search();
          }
        },
        error: (err: any) => {
          alert(err.error);
          console.error('Error fetching future preview details', err);
        }
      });

     
    }
  }

  openSplitDialog(){
    this.isSplitDialogOpen = true;
  }

  closeSplitDialog(){
    this.isSplitDialogOpen = false;
  }
  canCloseSplitDialog() {
    this.isSplitDialogOpen = false;
  }
   // getter for current header
  get currentHeader(): SplitPreviewHeader {
    return this.previewResponse?.previewHeader[this.currentIndex];
  }

  next(): void {
    if (this.currentIndex < this.previewResponse.previewHeader.length - 1) {
      this.currentIndex++;
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
}
