
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { ApiService } from 'src/app/services/api.service';
import { Receipt, ICON, MESSAGES, ReceiptLocation } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { ContextMenuComponent } from '@progress/kendo-angular-menu';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
    selector: 'app-execute-split-merge',
    templateUrl: './execute-split-merge.component.html',
    styleUrls: ['./execute-split-merge.component.scss'],
    standalone: false
})
export class ExecuteSplitMergeComponent implements OnDestroy {

  @ViewChild('gridContextMenu') public gridContextMenu!: ContextMenuComponent;

  readonly ICON = ICON;
  mergeLots: any = [];
  selectedLotId: number | null = null;
  mergeLotIdStr: string = "";
  mergedLotNumbers: string = "";
  isLoadingMergeLots:boolean = false;
  mergeMessage:string = "";
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

  readonly subscription = new Subscription()

  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void { 
    setTimeout(() => {
      this.search();
    }, 500);
    
    // this.subscription.add(this.appService.sharedData.icrDashboard.eventEmitter.subscribe((v) => {
    //   if (v === 'closeDialog') {
    //     this.closeDialog();
    //   }
    // }));
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  private fetchdata(): void {
  
    // this.apiService.getReceiptdatas(facilityIDsStr, receiptStatus, this.fromDate, this.toDate).subscribe({
    //   next: (response: any) => {
    //     this.originalData = response;
    //     this.pageData();
    //   },
    //   error: (error: any) => {
    //     console.error("Error fetching data:", error);
    //   }
    // });
}
  
fetchMergeLots(lotId: number): void {
      this.mergeLots = [];
      // this.mergeMessage = '';
      // this.isLoadingMergeLots = true;
    
      this.apiService.getMergeLots(lotId).subscribe({
        next: (response: any) => {
          this.isLoadingMergeLots = false;
          if (response && response.length > 0) {
            this.mergeLots = response;
            console.log("mergegrid",this.mergeLots)
          } else {
            this.mergeMessage = 'There is no matching record available.';
          }
        },
        error: (err: any) => {
          this.isLoadingMergeLots = false;
          this.mergeMessage = 'Error fetching merge lots.';
          console.error(err);
        }
      });
    }
    
  canCloseDialog() {
    this.appService.sharedData.icrDashboard.eventEmitter.emit('canCloseDialog?')
  }
  
  private isSearchClicked = false; // Track search button click

  search() {
    this.isSearchClicked = true; // Only apply filtering when search is clicked
    this.fetchdata();
  }

  getMachedLotsToMerge(trvStepId: number){
     this.apiService.getMatchedLots(trvStepId).subscribe({
        next: (matchedResponse: any) => {
            this.mergeLotIdStr = matchedResponse?.map((record: any) => record.mergedLotIds).join(', '); 
            this.mergedLotNumbers = matchedResponse?.map((record: any) => record.mergedLotNumbers).join(', '); 
        },
        error: (err: any) => {
          console.error('Error fetching matched lots', err);
        }
      });
  }

  OnExecuteMerge() {
    const userId = this.appService.loginId;
    const lotId = this.selectedLotId;
    const mergeLotIdStr = this.mergeLotIdStr;
    const isConsolidateSplit = true;
    const payload = {
      lotId,
      mergeLotIdStr,
      userId,
      isConsolidateSplit
    };
    this.apiService.mergeRequest(payload).subscribe({
      next:(response: any) => {
        if(response){
          this.mergeLotIdStr = "";
          this.mergeMessage = " Merge reuqest created successfully.";
        }
      },
      error: (err) => {
          this.mergeMessage = 'Error in merge request';
          console.error('Error in merge request', err);
      }
    });
  }
}
