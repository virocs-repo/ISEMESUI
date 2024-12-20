import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, ColumnMenuSettings, GridDataResult, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CustomerType, ICON, Receipt } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-combined-lot',
  templateUrl: './combined-lot.component.html',
  styleUrls: ['./combined-lot.component.scss']
})
export class CombinedLotComponent implements OnDestroy {
  readonly ICON = ICON;
  gridDataResult: GridDataResult = { data: [], total: 0 };
  public pageSize = 25;
  public skip = 0;
  readonly subscription = new Subscription();
  format: string = 'yyyy-MM-dd'; // Date format for kendo-datetimepicker
  fromDate: Date | null = null;  // Variable to store the selected 'from' date
  toDate: Date | null = null;    // Variable to store the selected 'to' date

  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchdata();
    this.subscription.add(this.appService.eventEmitter.subscribe(e => {
      if (e.action == 'updates') {
        this.init()
      }
    }))
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private init() {
   
  }
  private fetchdata() {
    this.apiService.SearchCombinationLots().subscribe({
      next: (v: any) => {
        this.gridDataResult.data = v;
        this.gridDataResult.total = v.length
        /* for (let index = 0; index < this.gridDataResult.data.length; index++) {
          const element = this.gridDataResult.data[index];
          element.customerTypeSelected = this.customerTypes.find(c => c.customerTypeID == element.customerID)
        } */
      },
      error: (v: any) => { }
    });
    
  }
  onSearch(): void {
 // Pass Date objects directly
 const from_date = this.fromDate ?? undefined;
 const to_date = this.toDate ?? undefined;

 this.apiService.SearchCombinationLotswithDates(from_date, to_date).subscribe({
     next: (v: any) => {
         this.gridDataResult.data = v;
         this.gridDataResult.total = v.length;
     },
     error: (error: any) => {
         console.error('Error fetching CombinationLots', error);
     }
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
    this.isDialogOpen = false;
    this.fetchdata(); 
  }

  doTestEditMode() {
    // this.onSelectRowActionMenu({ item: { text: 'Edit Data' } } as any, this.gridData[0]);
  }

  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  rowActionMenu: MenuItem[] = [
    { text: 'Edit Data', icon: 'edit', svgIcon: ICON.pencilIcon },
    { text: 'View Data', icon: 'eye', svgIcon: ICON.eyeIcon },
  ];
  dataItemSelected!: any;
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
        this.appService.sharedData.combolot.dataItem = dataItem
        this.appService.sharedData.combolot.isEditMode = false;
        this.appService.sharedData.combolot.isViewMode = true;
        // access the same in receipt component
        this.openDialog()
        break;
      case 'Edit Data':
        this.appService.sharedData.combolot.dataItem = dataItem
        this.appService.sharedData.combolot.isEditMode = true;
        this.appService.sharedData.combolot.isViewMode = false;
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
}