import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { forkJoin } from 'rxjs';
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
  public columnData: any[] = [
    { field: 'lotNum', title: 'Lot#/Serial#', visible: true },
    { field: 'location', title: 'Location', visible: true },
    { field: 'person', title: 'Person', visible: true },
    { field: 'qty', title: 'Qty', visible: true },
    { field: 'systemUser', title: 'System User', visible: true },
    { field: 'status', title: 'Status', visible: true },
    { field: 'receivedFrom', title: 'Received From', visible: false },
    { field: 'inventoryId', title: 'Inventory ID', visible: false},
    { field: 'locationId', title: 'Location ID',visible: false},
    { field: 'receivedFromId',title: 'ID',visible: false}
  ];
  employees: Employee[] = []
  employeesSelected: Employee[] = [];

  constructor(private appService: AppService,private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadGridData();
    this.employees = this.appService.masterData.entityMap.Employee;
  }

  extractUniqueValues(data: any[]) {
    const locationsSet = new Set<string>();
    const lotNumberSet = new Set<string>();
  
    data.forEach(item => {
      if (item.location) {
        locationsSet.add(item.location);
      }
      if (item.lotNum) {
        lotNumberSet.add(item.lotNum);
      }
    });
  
    this.uniqueLocations = Array.from(locationsSet);
    this.uniqueLotNumber = Array.from(lotNumberSet);
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
      this.appService.errorMessage('All three fields (Lot Number, Location, and Employee) must be filled.');
      return;
    }
  
    const lotNumber = this.selectedLotNumber;
    const location = this.selectedLocation;
    const employeeIds = this.employeesSelected.map(emp => emp.EmployeeID); 
    const existingRecordIndex = this.combinedData.findIndex(record => record.lotNum === lotNumber);

  
    this.apiService.getInventoryMove(lotNumber, location, employeeIds).subscribe({
      next: (res: any) => {
        res.forEach((record: any) => {
          const employee = this.employees.find(emp => emp.EmployeeID === record.EmployeeID);
          if (employee) {
            record.employeeName = employee.EmployeeName;
          }
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
  
    // Prepare update requests based on selected rows
    const updateData = {
      InvMovementDetails: selectedRows.map((record: any) => {
        const newStatus = record.status === 'Checked In' ? 'Checked Out' : 'Checked In';
        // Update the record status for local reference (optional)
        record.status = newStatus;
  
        return {
          InventoryID: record.inventoryId,
          LocationID: record.locationId,
          StatusID: newStatus === 'Checked In' ? 1 : 2, // Assuming 1 is Checked In and 2 is Checked Out
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
        },
        error: (err) => {
          console.error('Error updating inventory move status:', err);
        }
      });
  }
  
}