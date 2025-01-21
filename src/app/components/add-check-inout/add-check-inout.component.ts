import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
  @Input() isReadOnly: boolean = false;
  @Input() selectedRowData: any;
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('grid', { static: true }) grid!: GridComponent; 
  gridDataResult: GridDataResult = { data: [], total: 0 };
  public icons = { printIcon: printIcon };
  private previousLotNumber: string | null = null;
  readonly ICON = ICON;
  public status: 'CheckIn' | 'CheckOut' | null = null;
  public selectedQty: number | null = null;
  public returnToCustomer: boolean = false;
  public selectedLocation: string= '';
  public selectedReceivedFrom: string = '';
  public selectedLotNumber: string = '';
  public uniqueLocations: Array<string> = [];
  public uniqueReceivedFrom: Array<string> = [];
  public uniqueLotNumber: string[] = [];
  lotNumberInput: string = '';
  public pageSize = 25;
  public skip = 0;
  public combinedData: any[] = [];
  employees: Employee[] = []
  employeesSelected: string = "";
  public filteredLotNumbers: string[] = [...this.uniqueLotNumber];
  public columnData: any[] = [
    { field: 'lotNum', title: 'Lot#/Serial#', visible: true },
    { field: 'location', title: 'Location', visible: true },
    { field: 'receivedFrom', title: 'Received From/CheckOut To', visible: true },
    { field: 'qty', title: 'Qty', visible: false },
    { field: 'systemUser', title: 'Modified By', visible: true },
    { field: 'goodsType', title: 'Goods Type', visible: true},
    { field: 'status', title: 'Status', visible: true },
    { field: 'receivedFrom', title: 'Received From', visible: false },
    { field: 'inventoryId', title: 'Inventory ID', visible: false},
    { field: 'locationId', title: 'Location ID',visible: false},
    { field: 'receivedFromId',title: 'Received ID',visible: false}
  ];

  constructor(private appService: AppService,private apiService: ApiService) { 

  }

  ngOnInit(): void {
    this.loadGridData();
    this.loadLocations();
    this.employees = this.appService.masterData.entityMap.Employee;
    this.selectedLotNumber = this.selectedRowData.lotNum;
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
    this.lotNumberInput = value; // Update the input value
    this.filteredLotNumbers = value
      ? this.uniqueLotNumber.filter(lotNumber =>
          lotNumber.toLowerCase().includes(value.toLowerCase())
        )
      : [...this.uniqueLotNumber];
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

  ngDoCheck(): void {
    if (this.selectedLotNumber !== this.previousLotNumber) {
      this.previousLotNumber = this.selectedLotNumber;
      if (this.selectedLotNumber) {
        this.onLotNumberSelected(this.selectedLotNumber);
      }
    }
  }
  onLotNumberSelected(selectedLot: string): void {
    if (!selectedLot) {
      this.clearRequest();
      return;
    }
  
    this.apiService.getLotStatus(selectedLot).subscribe({
      next: (response: any) => {
        this.status = response[0]?.inventoryStatus;
  
        if (this.isCheckOutBehavior(this.status)) {
          //this.selectedLocation = response.location || '';
          this.selectedQty = response.qty || null;
          this.employeesSelected = response.receivedFrom || '';
        } else if (this.status === 'CheckIn') {
          this.returnToCustomer = false;
          this.employeesSelected = response.receivedFrom || '';
        }
      },
      error: (err) => {
        console.error('Error fetching lot status:', err);
      }
    });
  
    this.apiService.getInventoryCheckinCheckout(selectedLot).subscribe({
      next: (res: any) => {
        const uniqueRecords = this.getUniqueRecords(res);
        this.combinedData = [...uniqueRecords];
        this.gridDataResult = {
          data: this.combinedData,
          total: this.combinedData.length
        };
      
      if(this.combinedData.length > 0){
        const location = this.uniqueLocations.find(loc => loc == this.combinedData[0].location);
        this.selectedLocation = location == undefined ? '' : location;
      }

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
    this.selectedLocation = '';
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
  
    // Perform qty validation only if the current status is not 'CheckIn'
    if (record.status !== 'CheckIn' && this.selectedQty !== record.qty) {
      this.appService.errorMessage('Selected quantity does not match the record data.');
      return;
    }

    const newStatus = this.isCheckOutBehavior(record.status) ? 'CheckIn' : 'CheckOut';
    record.status = newStatus;
    const location = newStatus === 'CheckOut' ? record.location : this.selectedLocation;
    const updateData = {
      InvMovementDetails: [{
        InventoryID: record.inventoryId,
        Location: location,
        StatusID: newStatus === 'CheckIn' ? 1711 : 1712,
        ReceivedFrom: this.employeesSelected,
        LoginId: this.appService.loginId,
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
    return this.isCheckOutBehavior(record.status) ? 'Check In' : 'Check Out';
  }
  

private checkOutStatuses: string[] = ['CheckOut', 'Draft', 'Received', 'Shipped','Pending Receive','Pending Shipment'];

isCheckOutBehavior(status: string | null): boolean {
  return this.checkOutStatuses.includes(status || '');
}

}