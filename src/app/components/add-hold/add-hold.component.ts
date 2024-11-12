import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GridComponent, GridDataResult, RowArgs } from '@progress/kendo-angular-grid';
import { ContextMenuComponent, ContextMenuSelectEvent } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Employee, ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-add-hold',
  templateUrl: './add-hold.component.html',
  styleUrls: ['./add-hold.component.scss']
})
export class AddHoldComponent implements OnInit {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('grid', { static: true }) grid!: GridComponent; 
  @Input() selectedRowData: any;
  gridDataResult: GridDataResult = { data: [], total: 0 };
  readonly ICON = ICON;
  public gridData: any[] = [];
  public selectedLocation: number = 0;
  public selectedReceivedFrom: string = '';
  public selectedLotNumber: string = '';
  public uniqueLocations: Array<string> = [];
  public uniqueReceivedFrom: Array<string> = [];
  public uniqueLotNumber: Array<string> = [];
  public pageSize = 10;
  public skip = 0;
  public combinedData: any[] = [];
  employees: Employee[] = []
  employeesSelected: Employee[] = [];
  public filteredLotNumbers: Array<string> = [];
  public columnData: any[] = [
    { field: 'lotNum', title: 'Lot#/Serial#', visible: true },
    { field: 'location', title: 'Location', visible: true },
    { field: 'employeeNames', title: 'Person', visible: true },
    { field: 'qty', title: 'Qty', visible: true },
    { field: 'systemUser', title: 'System User', visible: true },
    { field: 'goodsType', title: 'Goods Type', visible: true},
    { field: 'status', title: 'Status', visible: true },
    { field: 'receivedFrom', title: 'Received From', visible: false },
    { field: 'inventoryId', title: 'Inventory ID', visible: false},
    { field: 'locationId', title: 'Location ID',visible: false},
    { field: 'receivedFromId',title: 'Received ID',visible: false}
  ];

  isEditMode: boolean = false;
  selectedRecords: any;

  constructor(private appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadGridData();
    this.loadLocations();
    this.employees = this.appService.masterData.entityMap.Employee;
    if (this.selectedRowData) {
      this.filterGridData(); 
    }
  }

  filterGridData(): void {
    if (this.selectedLotNumber && this.selectedLocation) {
      this.gridDataResult.data = this.gridData.filter(item =>
        item.lotNum === this.selectedLotNumber && item.location === this.selectedLocation
      );
      this.gridDataResult.total = this.gridDataResult.data.length;
    } else {
      this.gridDataResult.data = [...this.gridData];
      this.gridDataResult.total = this.gridData.length;
    }
  }

  ngOnChanges(): void {
    if (this.selectedRowData) {
      this.gridData = [this.selectedRowData]; 
      this.selectedLotNumber = this.selectedRowData.lotNum;
      this.selectedLocation = this.selectedRowData.location;
      this.employeesSelected = this.selectedRowData.employeeNames ? [this.selectedRowData.employeeNames] : [];
      this.selectedReceivedFrom = this.selectedRowData.receivedFrom;
    }
  }

  onLotNumberChange(): void {
    this.filterGridData();
  }
  
  onLocationChange(): void {
    this.filterGridData();
  }

  loadGridData(): void {
    const lotNumber = this.selectedLotNumber;
    const location = this.selectedLocation;
    const employeeIds = this.employeesSelected.map(employee => employee.EmployeeID);
    this.apiService.getInventoryMove(lotNumber, location, employeeIds).subscribe({
      next: (data: any) => {
        this.extractUniqueValues(data);
        this.gridDataResult.data = data;
        this.gridDataResult.total = data.length;
      },
      error: (err) => {
        console.error('Error loading grid data:', err);
      }
    });
  }
  

  extractUniqueValues(data: any[]): void {
    const lotNumberSet = new Set<string>();

    data.forEach(item => {
      if (item.lotNum) {
        lotNumberSet.add(item.lotNum);
      }
    });
    this.uniqueLotNumber = Array.from(lotNumberSet);
    this.filteredLotNumbers = [...this.uniqueLotNumber];
  }

  loadLocations(): void {
    this.apiService.GetInventoryLocation().subscribe(
      (data: any) => {
        const locations = data as any[];
        this.uniqueLocations = [...new Set(locations.map(loc => loc.location))];
      },
      error => {
        console.error('Error fetching locations:', error);
      }
    );
  }

  onLotNumberFilter(value: string): void {
    this.filteredLotNumbers = value
      ? this.uniqueLotNumber.filter(lotNumber => lotNumber.toLowerCase().includes(value.toLowerCase()))
      : [...this.uniqueLotNumber];
  }

  editRow(dataItem: any): void {
    this.isEditMode = true;
    this.selectedRowData = dataItem;
    this.selectedLotNumber = dataItem.lotNum;
    this.selectedLocation = dataItem.location;
    this.employeesSelected = dataItem.employeeNames ? [dataItem.employeeNames] : [];
    this.selectedReceivedFrom = dataItem.receivedFrom;
  }

  onSelectionChange(event: any): void {
    const selectedData = event.selectedRows[0]?.dataItem;
    if (selectedData) {
      this.editRow(selectedData);
    }
  }

  
  clearRequest(): void {
    this.gridDataResult = { data: [], total: 0 };
    this.selectedLocation = 0;
    this.selectedReceivedFrom = '';
    this.selectedLotNumber = '';
    this.cancel.emit();
    this.isEditMode = false; 
    this.selectedRowData = null;
  }
}
