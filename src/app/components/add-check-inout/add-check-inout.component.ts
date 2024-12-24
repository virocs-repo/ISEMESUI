import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { printIcon } from '@progress/kendo-svg-icons';
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
  public icons = { printIcon: printIcon };
  readonly ICON = ICON;
  public status: 'CheckIn' | 'CheckOut' | null = null;
  public selectedQty: number | null = null;
  public returnToCustomer: boolean = false;
  public selectedLocation: number= 0;
  public selectedReceivedFrom: string = '';
  public selectedLotNumber: string = '';
  public uniqueLocations: Array<string> = [];
  public uniqueReceivedFrom: Array<string> = [];
  public uniqueLotNumber: Array<string> = [];
  public pageSize = 25;
  public skip = 0;
  public combinedData: any[] = [];
  employees: Employee[] = []
  employeesSelected: Employee[] = [];
  public filteredLotNumbers: Array<string> = [];
  public columnData: any[] = [
    { field: 'lotNum', title: 'Lot#/Serial#', visible: true },
    { field: 'location', title: 'Location', visible: true },
    { field: 'employeeNames', title: 'Person', visible: true },
    { field: 'qty', title: 'Qty', visible: false },
    { field: 'systemUser', title: 'System User', visible: true },
    { field: 'goodsType', title: 'Goods Type', visible: true},
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
    this.apiService.GetInventoryCheckinCheckoutLocation().subscribe(
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
    this.apiService.getAllInventoryCheckinCheckoutStatus().subscribe({
      next: (data: any) => {
        this.extractUniqueValues(data);
      },
      error: (err) => {
        console.error('Error loading grid data:', err);
      }
    });
  }

  onLotNumberSelected(selectedLot: string): void {
    if (!selectedLot) {
      this.clearRequest(); // Clears the grid and other form inputs
      return;
    }
  
    // Fetching status for the selected lot number
    this.apiService.getLotStatus(selectedLot).subscribe({
      next: (response: any) => {
        this.status = response[0]?.inventoryStatus;
        if (this.status === 'CheckIn') {
          this.selectedLocation = response.location || '';
          this.selectedQty = response.qty || null;
          this.employeesSelected = response.receivedFrom || [];
        } else if (this.status === 'CheckOut') {
          this.returnToCustomer = false;
          this.employeesSelected = response.receivedFrom || [];
        }
      },
      error: (err) => {
        console.error('Error fetching lot status:', err);
      }
    });
  
    // Fetching inventory data for the selected lot number
    this.apiService.getInventoryCheckinCheckout(selectedLot).subscribe({
      next: (res: any) => {
        const uniqueRecords = this.getUniqueRecords(res);
  
        // Set the unique data to the combined data and update the grid
        this.combinedData = [...uniqueRecords];
        this.gridDataResult = {
          data: this.combinedData,
          total: this.combinedData.length
        };
      },
      error: (err) => {
        console.error('Error fetching inventory check-in/out data:', err);
      }
    });
  }

  getUniqueRecords(records: any[]): any[] {
    const uniqueMap = new Map();
  
    records.forEach((record) => {
      const key = `${record.lotNum}-${record.location}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, record);
      }
    });
  
    return Array.from(uniqueMap.values());
  }  

  clearRequest(): void {
    this.gridDataResult = { data: [], total: 0 };
    this.selectedLocation = 0;
    this.selectedReceivedFrom = '';
    this.selectedLotNumber = '';
    this.cancel.emit();
  }  

  onCheckInOut(): void {
    const record = this.gridDataResult.data[0];
    if (!record) {
      this.appService.errorMessage('No record available to check in/out.');
      return;
    }

    if (this.selectedQty !== record.qty) {
      this.appService.errorMessage('Selected quantity does not match the record data.');
      return;
    }  

    const newStatus = record.status === 'CheckIn' ? 'CheckOut' : 'CheckIn';
    record.status = newStatus;
  
    const updateData = {
      InvMovementDetails: [{
        InventoryID: record.inventoryId,
        Location: record.location,
        StatusID: newStatus === 'CheckIn' ? 1711 : 1712,
        ReceivedFromID: record.receivedFromId,
        LoginId: 1
      }]
    };
  
    console.log('Sending update data to API:', updateData);
    this.apiService.upsertInventoryCheckinCheckoutStatus(updateData, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Inventory move status updated successfully:', response);
          this.cancel.emit(); 
        },
        error: (err) => {
          console.error('Error updating inventory move status:', err);
        }
      });
  }
  get checkInOutLabel(): string {
    const record = this.gridDataResult.data[0]; 
    if (!record) {
      return 'Check in / Check out'; 
    }
    return record.status === 'CheckIn' ? 'Check Out' : 'Check In';
  }
  
}