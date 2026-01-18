import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoCompleteComponent,MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { trashIcon } from '@progress/kendo-svg-icons';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';
import { ICON } from 'src/app/services/app.interface';
import { GridComponent, GridModule } from "@progress/kendo-angular-grid";
import { AvatarComponent } from "@progress/kendo-angular-layout";
import { NumericTextBoxComponent, CheckBoxModule } from "@progress/kendo-angular-inputs";
import { DialogModule } from "@progress/kendo-angular-dialog";
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { IconsModule } from '@progress/kendo-angular-icons';

@Component({
  selector: 'app-checkin-checkout',
  templateUrl: './checkin-checkout.component.html',
  styleUrls: ['./checkin-checkout.component.css'],
  imports: [GridComponent, GridModule, AvatarComponent, MultiSelectComponent, NumericTextBoxComponent, DialogModule, ButtonModule,IconsModule]
})
export class CheckinCheckoutComponent {
 public ICON = ICON;
 constructor(public appService: AppService,
             private apiService: ApiService,
             private route:ActivatedRoute,
             private router: Router) { 
   
  }
   @ViewChild('autocomplete')
  autocomplete!: AutoCompleteComponent;
  activeTab = 0;
  showTop10 = false;
  barcodeValue = '';
  username = localStorage.getItem('userName') || '';
  isAuthorized = false;
  checkInSearchText = '';
  checkOutSearchText = '';
  checkInCheckOutText = '';
  checkInResults: any[] = [];
  checkOutResults: any[]  = [];
  highlightFirst = true;
  filteredCheckInResults: any[] = [];
  filteredCheckOutResults: any[] = [];
  topTenCheckOutResults: any[] = ['L11250028'];
  filteredCheckInComboResults: any[] = [];
  filteredCheckOutComboResults: any[] = [];
  type: string = '';
  selectedKeys: any[] = [];
  selecctedLots: string[] = [];
  public svgTrash = trashIcon; 
  hideTags = () => [];
  showStatusDialog = false;
  dialogTitle = '';
  dialogMessage = '';
  dialogType: 'success' | 'error' = 'success';
  ngOnInit() {
   
    this.type = this.route.snapshot.params['type']; 
    this.checkInCheckOutText = this.type === 'checkin' ? "Check-In" : this.type === 'checkout' ? "Check-Out" : "";
    this.searchAndAddCheckOutLots(this.type); 
    if(this.type === 'checkout'){
      this.getTop10();
    }   
  }
    

  searchAndAddCheckOutLots(type:string) {
    this.apiService.getCheckInCheckOutItems("", Number(localStorage.getItem('employeeId')), Number(localStorage.getItem('customerLoginId')), this.type, null).subscribe((response: any[]) => {
        if (response.length > 0) {            
            if(this.type === 'checkin'){
              this.appService.sharedData.chekInResult = response;
              if(this.appService.sharedData.chekInResult.length > 0){
                this.checkInResults = response;
                //this.filteredCheckInComboResults = [...this.checkInResults];
              }
            }
            if(this.type === 'checkout'){
              this.appService.sharedData.chekOutResult = response;
              if(this.appService.sharedData.chekOutResult.length > 0){
                this.checkOutResults = response;
                //this.filteredCheckOutComboResults = [...this.checkOutResults];
             }
            }
        } 
    });
  }
  isSelected(item: any): boolean {
    return this.selectedKeys.some(i => i.iseLotNumber === item.iseLotNumber);
  }
  onCheckboxClick($event: any, item: any) {
    $event.stopPropagation(); 
    this.onSelectionChange([...item.lotId]);
  }
  onSelectionChange(selectedLotIds: any[]): void {
    if (selectedLotIds.length > 0) {
      if(this.type === 'checkout'){
        this.filteredCheckOutResults = this.checkOutResults.filter(lot=> selectedLotIds.includes(lot.lotId));
      }else if(this.type === 'checkin'){
        this.filteredCheckInResults = this.checkInResults.filter(lot=> selectedLotIds.includes(lot.lotId));
        
      }
      this.selectedKeys = selectedLotIds
    } else {
      if(this.type === 'checkout'){
        this.filteredCheckOutResults = [...this.filteredCheckOutResults];
      }else if(this.type === 'checkin'){
        this.filteredCheckInResults = [...this.filteredCheckInResults];
      }
      this.selectedKeys = selectedLotIds;
      
    }
  }
  cancel() {
    this.router.navigate(['/publicform']);   // Redirect to Public Form
  }
  getTop10() {
     this.apiService.getCheckInCheckOutItems("", Number(localStorage.getItem('employeeId')), Number(localStorage.getItem('customerLoginId')), this.type, 10).subscribe((response: any[]) => {
        if (response.length > 0) {            
           
            if(this.type === 'checkout'){
              this.appService.sharedData.chekOutResult = response;
              if(this.appService.sharedData.chekOutResult.length > 0){
                this.topTenCheckOutResults = response;
                
              }
            }
        }         
    });
  }
  Add() {
    var selectedItems = this.topTenCheckOutResults.filter(x => this.selectedKeys.includes(x.lotId));
    this.filteredCheckOutResults = [ ...this.filteredCheckOutResults, ...selectedItems];
    this.showTop10 = false;
  }
   removeHandler(dataItem:any): void {
     if(this.type == 'checkin'){
      var results = this.filteredCheckInResults.filter(item => item.lotId !== dataItem.lotId);
      this.filteredCheckInResults = [...results];
      this.selectedKeys = this.filteredCheckInResults.map(lot => lot.lotId);
     }else if(this.type == 'checkout'){
       var results = this.filteredCheckOutResults.filter(item => item.lotId !== dataItem.lotId);
        this.filteredCheckOutResults = [...results];
        this.selectedKeys = this.filteredCheckOutResults.map(lot => lot.lotId);
     }
  }
  closeCheckOut() {
    this.showTop10 = false;
  }
  submitSelected() {
   this.saveCheckInCheckOut();
  }   
  isPrimary(btn: any): boolean {
    return !this.filteredCheckOutResults.some(
      r => r.iseLotNumber === btn.iseLotNumber
    );
  }
  isDisabled(btn: any): boolean {
    if(this.type === 'checkin') {
      return this.filteredCheckInResults.some(
        r => r.iseLotNumber === btn.iseLotNumber
      );
    }else if(this.type === 'checkout'){
      return this.filteredCheckOutResults.some(
        r => r.iseLotNumber === btn.iseLotNumber
      );
    }
    return false;
  }
  addSelectedToGrid() {
    this.filteredCheckOutComboResults = [...this.checkOutResults]
  }
  onFilter(value: string) {
    const filterValue = value.toLowerCase();
    if(this.type == 'checkin'){
      this.filteredCheckInComboResults = this.checkInResults.filter(lot =>
        lot.iseLotNumber.toLowerCase().includes(filterValue)
      );
    } else if(this.type == 'checkout'){
      const filterValue = value.toLowerCase();
      this.filteredCheckOutComboResults = this.checkOutResults.filter(lot =>
        lot.iseLotNumber.toLowerCase().includes(filterValue)
      );
    }
  }
  
  saveCheckInCheckOut() {
    var payload = {}
    
     var employeeId = Number(localStorage.getItem('employeeId')) > 0 ? Number(localStorage.getItem('employeeId')) : Number(localStorage.getItem('customerLoginId')) > 0 ? Number(localStorage.getItem('customerLoginId')) : 0;
    var userType = Number(localStorage.getItem('employeeId')) > 0 ? "Employee" : Number(localStorage.getItem('customerLoginId')) > 0 ? "Customer" : "";
     var errorFound = false;
    if(this.type === 'checkin'){
      
      let lotDetails: any[] = [];
      this.filteredCheckInResults.forEach((lot) => {
        if(lot.quantity > lot.totalCount){
          this.openStatusDialog("error", "Entered qty should be less than total ccount "+ lot.iseLotNumber);
          errorFound = true;
        }
        lotDetails.push({
            LotId: lot.lotId,
            Quantity: lot.quantity,
          });
      });
      payload = {
        ScanBadge: localStorage.getItem('scanBadge') || '',
        UserId: employeeId,
        UserType: userType,
        Lots: lotDetails
      };
    }else if(this.type === 'checkout'){
      let lotIds: number[] = this.filteredCheckOutResults.map(lot => lot.lotId);
      payload = {
        ScanBadge: localStorage.getItem('scanBadge') || '',
        UserId: employeeId,
        UserType: userType,
        LotIds: lotIds
      };
    }
    if(errorFound == false){
      this.apiService.saveCheckInCheckOutRequest(JSON.stringify(payload), this.type).subscribe((response: any) => {
        
          if(response == 'true' && this.type === 'checkin'){
            this.openStatusDialog('success', 'Check-In successful.');
          }else if(response == 'true' && this.type === 'checkout'){
            this.openStatusDialog('success', 'Check-Out successful.');
          }else{
            this.openStatusDialog('error', 'Operation failed. Please try again.');
          }
      });
    }
  }

  clearFilterState() {
    setTimeout(() => {
      this.filteredCheckOutComboResults = [];
      this.filteredCheckInComboResults = [];
    });
  }
  tagMapper = (tags: any[]) => {
    return tags.map(() => ({
      text: '', // No label
      data: null
    }));
  };
  openStatusDialog(type: 'success' | 'error', message: string) {
    this.dialogType = type;
    this.dialogMessage = message;
    this.dialogTitle = type === 'success' ? 'Success' : 'Error';
    this.showStatusDialog = true;
  }

  closeStatusDialog() {
    if(this.dialogType === 'success'){
      this.router.navigate(['/publicform']);   // Redirect to Public Form
    }else{
      this.showStatusDialog = false;
    }
  }
  addKey(lotId: any): void {
    this.onSelectionChange([...this.selectedKeys, lotId]);
  }
}
