import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-add-check-inout',
  templateUrl: './add-check-inout.component.html',
  styleUrls: ['./add-check-inout.component.scss']
})
export class AddCheckInoutComponent implements OnInit {
  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;
  @Output() cancel = new EventEmitter<void>();
  readonly ICON = ICON;
  
  public selectedValues: string = "";
  public selectedLocation: string = "";
  public selectedReceivedFrom: string = "";
  public selectedLotNumber: string = "";
  
  public uniqueLocations: Array<string> = [];
  public uniqueReceivedFrom: Array<string> = [];
  public uniqueLotNumber: Array<string> = [];
  
  public pageSize = 10;
  public skip = 0;
  public combinedData: any[] = [];
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  public items: any[] = [
    { text: 'Item1', icon: 'edit' },
    { text: 'Item2', icon: 'delete' },
    { text: 'Item3', icon: 'copy' }
  ];

  public columnData: any[] = [
    { field: 'lotNum', title: 'Lot#/Serial#', visible: true },
    { field: 'location', title: 'Location', visible: true },
    { field: 'person', title: 'Person', visible: true },
    { field: 'qty', title: 'Qty', visible: true },
    { field: 'systemUser', title: 'System User', visible: true },
    { field: 'status', title: 'Status', visible: true },
    { field: 'receivedFrom', title: 'Received From', visible: false }
  ];

  selectedRecords: any;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadGridData();
  }

  extractUniqueValues(data: any[]) {
    const locationsSet = new Set<string>();
    const receivedFromSet = new Set<string>();
    const lotNumberSet = new Set<string>();

    data.forEach(item => {
      if (item.location) {
        locationsSet.add(item.location);
      }
      if (item.receivedFrom) {
        receivedFromSet.add(item.receivedFrom);
      }
      if(item.lotNum){
        lotNumberSet.add(item.lotNum);
      }
    });

    this.uniqueLocations = Array.from(locationsSet);
    this.uniqueReceivedFrom = Array.from(receivedFromSet);
    this.uniqueLotNumber = Array.from(lotNumberSet);
  }

  loadGridData() {
    this.apiService.getAllInventoryMoveStatus().subscribe({
      next: (v: any) => {
        this.gridDataResult.data = v;
        this.gridDataResult.total = v.length;
        console.log(v);
        this.extractUniqueValues(v);
      },
      error: (v: any) => { }
    });
  }

  onSearch(): void {
    // Clear the grid before fetching the new filtered data
    this.gridDataResult.data = [];

    const lotNumber = this.selectedLotNumber || 'All';
    const location = this.selectedLocation || 'All';
    const receivedFrom = this.selectedReceivedFrom || 'All';

    this.apiService.getInventoryMove(lotNumber, location, receivedFrom).subscribe({
      next: (res: any) => {
        console.log(res);
        this.gridDataResult.data = res;
        this.gridDataResult.total = res.length;
      },
      error: (err) => {
        this.gridDataResult.data = [];
        this.gridDataResult.total = 0;
      }
    });
  }

  clearRequest(): void {
    this.cancel.emit();
  }
}