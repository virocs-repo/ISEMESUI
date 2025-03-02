import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { MESSAGES, ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { DatePipe } from '@angular/common';

enum ActionType {
  EditData = 'Edit Data',
  ViewData = 'View Data',
  VoidData = 'Void Data'
}

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
  providers:[DatePipe]
})
export class TicketComponent implements OnDestroy {
  readonly ICON = ICON;
  gridDataResult: GridDataResult = { data: [], total: 0 };
  public pageSize = 10;
  public skip = 0;
  readonly subscription = new Subscription();
  format: string = 'yyyy-MM-dd'; // Date format for kendo-datetimepicker
  fromDate: Date | null = null;  // Variable to store the selected 'from' date
  toDate: Date | null = null;    // Variable to store the selected 'to' date
  searchTerm:string="";
  originalData: any[] = [];
  showhideAddTicketButton:boolean = false;
  
  constructor(public appService: AppService, private apiService: ApiService, public datePipe: DatePipe) { 
     
    this.fromDate = new Date();
    this.fromDate.setMonth(this.fromDate.getMonth() - 2);
    this.toDate = new Date();
    this.fetchdata();

  }

  ngOnInit(): void {
    this.init()
    this.subscription.add(this.appService.sharedData.addTicket.eventEmitter.subscribe((v) => {
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
    if(this.appService.roleName == 'Reviewer') {
      this.showhideAddTicketButton = false;
    }
    else{
      this.showhideAddTicketButton = true;
    }
  }
  canCloseDialog() {
    this.appService.sharedData.addTicket.eventEmitter.emit('canCloseDialog?')
  }
  fetchdata() {
    debugger;
    this.apiService.searchTickets(this.fromDate, this.toDate).subscribe({
      next: (v: any) => {
        
        this.originalData = v;
        this.pageData();
      },
      error: (v: any) => { }
    });
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

  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  rowActionMenu: MenuItem[] = [
    { text: 'Void Data', icon: 'close', svgIcon: ICON.xIcon },
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
  ];
  dataItemSelected!: any;
  selectedRowIndex: number = -1;
  onCellClick(e: CellClickEvent): void {
    
    if (e.type === 'contextmenu') {
      const originalEvent = e.originalEvent;
      originalEvent.preventDefault();
      this.dataItemSelected = e.dataItem;
      this.selectedRowIndex = e.rowIndex;
      this.gridContextMenu.show({ left: originalEvent.pageX, top: originalEvent.pageY });
      this.enableDisableRowMenuItems(this.dataItemSelected);
    }
  }
  
  enableDisableRowMenuItems(dataItem:any){
    
    const voidMenuItem = this.rowActionMenu.find((a: any) => a.text == ActionType.VoidData);
    const editMenuItem = this.rowActionMenu.find((a: any) => a.text == ActionType.EditData);
    const viewMenuItem = this.rowActionMenu.find((a: any) => a.text == ActionType.ViewData);

    if(this.appService.roleName == 'Reviewer' || dataItem.ticketStatusID > 4) {
      if(voidMenuItem)
        voidMenuItem.disabled = true;
    }

    if(this.appService.roleName == 'Reviewer'){
      if(dataItem.ticketStatusID == 2 || dataItem.ticketStatusID == 4){
        if(editMenuItem)
          editMenuItem.disabled = false;
        if(viewMenuItem)
          viewMenuItem.disabled = false;
      }
      else {
        if(editMenuItem)
          editMenuItem.disabled = true;
        if(viewMenuItem)
          viewMenuItem.disabled = false;
      }
    }
    else {
      if(dataItem.requestorID == this.appService.loginId && (dataItem.ticketStatusID == 1 || dataItem.ticketStatusID == 2 || dataItem.ticketStatusID == 3)){
        if(editMenuItem)
          editMenuItem.disabled = false;
        if(viewMenuItem)
          viewMenuItem.disabled = false;
      }
      else {
        if(editMenuItem)
          editMenuItem.disabled = true;
        if(viewMenuItem)
          viewMenuItem.disabled = false;
      }
    }
  }

  onSelectRowActionMenu(e: ContextMenuSelectEvent) {
     
    const dataItem = this.dataItemSelected;
    
    switch (e.item.text) {
      case 'Void Data':
        this.apiService.voidTicket(dataItem.ticketID).subscribe({
          next: (v:any) => { 
            this.fetchdata();
          },
          error:(e:any) => { }
        })
      break;
      case 'View Data':
        this.appService.sharedData.addTicket.dataItem = dataItem
        this.appService.sharedData.addTicket.isEditMode = false;
        this.appService.sharedData.addTicket.isViewMode = true;

        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.addTicket.dataItem = dataItem
        this.appService.sharedData.addTicket.isEditMode = true;
        this.appService.sharedData.addTicket.isViewMode = false;
        // access the same in receipt component
        this.openDialog()
        break;

      default:
        break;
    }
  }

  addTicket(){
     
    this.appService.sharedData.addTicket.dataItem = {};
    this.appService.sharedData.addTicket.isEditMode = false;
    this.appService.sharedData.addTicket.isViewMode = false;

    this.openDialog();
  }

  rowCallback = (context: any) => {
    return {
      'highlighted-row': context.index === this.selectedRowIndex
    };
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