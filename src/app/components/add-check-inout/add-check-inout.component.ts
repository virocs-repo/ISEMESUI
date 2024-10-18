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
  
  public selectedLocation: string = '';
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
      if(item.lotNum){
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
    // Check if all required fields are filled
    if (!this.selectedLotNumber || !this.selectedLocation || this.employeesSelected.length === 0) {
      console.error('All three fields (Lot Number, Location, and Employee) must be filled.');
      return; // Exit the function if any of the fields are missing
    }
  
    const lotNumber = this.selectedLotNumber;
    const location = this.selectedLocation;
    const employeeIds = this.employeesSelected.map(emp => emp.EmployeeID); // Use Employee IDs
  
    this.apiService.getInventoryMove(lotNumber, location, employeeIds).subscribe({
      next: (res: any) => {
        res.forEach((record: any) => {
          const employee = this.employees.find(emp => emp.EmployeeID === record.EmployeeID);
          if (employee) {
            record.employeeName = employee.EmployeeName;
          }
        });
        this.combinedData = [...this.combinedData, ...res];
        this.gridDataResult = {
          data: this.combinedData,
          total: this.combinedData.length
        };
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }
  
  clearRequest(): void {
    this.gridDataResult = { data: [], total: 0 };
    this.selectedLocation = '';
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
      alert('Please select at least one record to check in/out.');
      return;
    }
    if (selectedRows.length === 0) {
      this.toggleAllRowsStatus();
      return;
    }
    
    selectedRows.forEach((record: any) => {
      const newStatus = record.status === 'Checked In' ? 'Checked Out' : 'Checked In';
      record.status = newStatus;
      const updateData = {
        InvMovementDetails: [{
          InventoryID: record.inventoryID,
          LocationID: record.locationID,
          StatusID: newStatus === 'Checked In' ? 1 : 2,
          LoginId: record.loginId
        }]
      };
  
      console.log('Sending update data to API:', updateData);
  
      // Call the API to update the status
      this.apiService.upsertInventoryMoveStatus(updateData, { responseType: 'text' }).subscribe({
        next: (response: any) => {
          console.log('API response:', response); // Log the response to ensure success
          console.log('Status updated for Inventory ID:', record.inventoryID);
        },
        error: (err: any) => {
          console.error('Error updating status:', err);
        }
      });
    });
  
    // Refresh grid data after the update
    this.loadGridData();
  }
  
  
  toggleAllRowsStatus(): void {
    this.gridDataResult.data.forEach((record: any) => {
      const newStatus = record.status === 'Checked In' ? 'Checked Out' : 'Checked In';
      record.status = newStatus;
      const requestPayload = {
        InvMovementDetails: [{
          InventoryID: record.inventoryID,
          LocationID: record.locationID,
          StatusID: newStatus === 'Checked In' ? 1 : 2,
          LoginId: record.loginId 
        }]
      };
      console.log('Sending update data to API:', requestPayload);
  
      // Pass both the payload and the options (with responseType: 'text') here
      this.apiService.upsertInventoryMoveStatus(requestPayload, { responseType: 'text' }).subscribe({
        next: () => {
          console.log('Status updated for Inventory ID:', record.inventoryID);
        },
        error: (err) => {
          console.error('Error updating status:', err);
        }
      });
    });
  
    // Reload grid data after the status update
    this.loadGridData();
  }
  
}