import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-test-comp',
    templateUrl: './test-comp.component.html',
    styleUrls: ['./test-comp.component.scss'],
    standalone: false
})
export class TestCompComponent {
  identifiers = ['Test', 'Test&Rel', 'Rel', 'Customer Lot', 'TBD'];
  lotStatuses = ['Completed', 'FGI', 'Freezed', 'In Progress', 'InterCompany Transfer'];
  travelerStatuses = ['Conditional Approval', 'Draft', 'Freezed', 'Pending Approval', 'Rejected'];
  holdOptions = ['All', 'Yes', 'No'];
  
  customers = ['--Select--', 'Customer A', 'Customer B'];
  deviceFamilies = ['--Select--', 'Family A', 'Family B'];
  devices = ['--Select--', 'Device X', 'Device Y'];
  deviceAliases = ['--Select--', 'Alias X', 'Alias Y'];
  
  locations = ['Fremont', 'San Jose', 'Remote'];

  public pageSize = 25;
    public skip = 0;
    public gridDataResult: GridDataResult = { data: [], total: 0 };
    public originalData: any[] = [];
  
    public searchTerm: string = '';
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
    
  constructor(public appService: AppService, private apiService: ApiService) { 
       
  
    }


      onCellClick(e: CellClickEvent): void {
        if (e.type === 'contextmenu') {
          //this.showContextMenu(e);
        } else {
          if (e.type == 'click') {
            if (['Mac', 'iOS'].includes(this.appService.deviceDetectorService.os)) {
              //this.showContextMenu(e);
            }
          }
        }
      }
       pageChange(event: PageChangeEvent): void {
          this.skip = event.skip;
          //this.searchData();
        }
        selectedRowIndex: number = -1;
        rowCallback = (context: any) => {
          return {
            'highlighted-row': context.index === this.selectedRowIndex
          };
        }
}
