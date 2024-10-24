import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Employee, ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-add-check-inout',
  templateUrl: './add-check-inout.component.html',
  styleUrls: ['./add-check-inout.component.scss']
})
export class AddCheckInoutComponent implements OnInit {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('grid', { static: true }) grid!: GridComponent; 
  gridDataResult: GridDataResult = { data: [], total: 0 };
  readonly ICON = ICON;
  
  public selectedLocation: number= 0;
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
    { field: 'status', title: 'Status', visible: true },
    { field: 'receivedFrom', title: 'Received From', visible: false },
    { field: 'inventoryId', title: 'Inventory ID', visible: false},
    { field: 'locationId', title: 'Location ID',visible: false},
    { field: 'receivedFromId',title: 'Received ID',visible: false}
  ];

  constructor(private appService: AppService,private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadGridData();
    this.loadLocations();
    this.employees = this.appService.masterData.entityMap.Employee;
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
  
  onLotNumberFilter(value: string): void {
    if (value) {
      this.filteredLotNumbers = this.uniqueLotNumber.filter(
        (lotNumber) => lotNumber.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      this.filteredLotNumbers = [...this.uniqueLotNumber];
    }
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

  loadGridData(): void {
    this.apiService.getAllInventoryMoveStatus().subscribe({
      next: (data: any) => {
        this.extractUniqueValues(data);
      },
      error: (err) => {
        console.error('Error loading grid data:', err);
      }
    });
  }

  add(): void {
    if (!this.selectedLotNumber || !this.selectedLocation || this.employeesSelected.length === 0) {
      this.appService.errorMessage('Please enter mandatory fields.');
      return;
    }
  
    const lotNumber = this.selectedLotNumber;
    const location = this.selectedLocation;
    const employeeIds = this.employeesSelected.map(emp => emp.EmployeeID); 
    const employeeNames = this.employeesSelected.map(emp => emp.EmployeeName).join(', ');
    const existingRecordIndex = this.combinedData.findIndex(record => record.lotNum === lotNumber);

  
    this.apiService.getInventoryMove(lotNumber, location, employeeIds).subscribe({
      next: (res: any) => {
        res.forEach((record: any) => {
          record.employeeNames = employeeNames;
        });
        if (existingRecordIndex === -1) {
          this.combinedData = [...this.combinedData, ...res];
        } else {
          this.combinedData[existingRecordIndex] = { ...this.combinedData[existingRecordIndex], ...res[0] };
        }
  
        this.gridDataResult = {
          data: this.combinedData,
          total: this.combinedData.length
        };
        this.selectedLotNumber = '';
        this.selectedLocation = 0;
        this.employeesSelected = [];
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }
  
  clearRequest(): void {
    this.gridDataResult = { data: [], total: 0 };
    this.selectedLocation = 0;
    this.selectedReceivedFrom = '';
    this.selectedLotNumber = '';
    this.cancel.emit();
  }  

  public selectedRecords: any[] = [];

  onSelectionChange(event: any): void {
    this.selectedRecords = event.selectedRows.map((row: { dataItem: any; }) => row.dataItem);
  }

  onCheckInOut(): void {
    const selectedRows = this.selectedRecords;
  
    if (selectedRows.length === 0) {
      this.appService.errorMessage('Please select at least one record to check in/out.');
      return;
    }
    const updateData = {
      InvMovementDetails: selectedRows.map((record: any) => {
        const newStatus = record.status === 'Checked In' ? 'Checked Out' : 'Checked In';
        record.status = newStatus;
  
        return {
          InventoryID: record.inventoryId,
          LocationID: record.locationId,
          StatusID: newStatus === 'Checked In' ? 1 : 2,
          ReceivedFromID: record.receivedFromId, 
          LoginId: record.loginId
        };
      })
    };
  
    console.log('Sending update data to API:', updateData);
    this.apiService.upsertInventoryMoveStatus(updateData, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Inventory move status updated successfully:', response);
          this.loadGridData();
          this.clearRequest();
          this.cancel.emit(); 
        },
        error: (err) => {
          console.error('Error updating inventory move status:', err);
        }
      });
  }
  
}