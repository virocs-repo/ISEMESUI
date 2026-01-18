import { DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { CellClickEvent, GridDataResult, PageChangeEvent, SelectionEvent } from '@progress/kendo-angular-grid';
import { googlePlusBoxIcon } from '@progress/kendo-svg-icons';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Assemblylist, Coo, Customer, ICON, LotTypeList, MESSAGES, PSCode, Testcategorylist, TestModelist } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { trashIcon } from '@progress/kendo-svg-icons';

@Component({
  selector: 'app-edit-traveller',
  standalone: false,
  templateUrl: './edit-traveller.component.html',
  styleUrls: ['./edit-traveller.component.scss']
})

export class EditTravellerComponent {
  public pageSize = 25;
    public skip = 0;
    public gridDataResult: GridDataResult = { data: [], total: 0 };
    public originalData: any[] = [];
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
    isDialogOpen = false;
    readonly subscription = new Subscription()
    public searchTerm: string = '';
    public lotNumber: string = '';
    public Customerlist:[] | undefined;
    Selectedcustomer:null | undefined;
   customers: Customer[] = [...this.appService.masterData.entityMap.Customer];
  customerSelected: Customer | undefined;
    lotTypelist: LotTypeList[] = this.appService.masterData.lotTypelist;
    SelectedlotType: LotTypeList | undefined;
    Coolist: Coo[] = this.appService.masterData.coo;
    Selectedcoo: Coo | undefined;
    Testcategorylist: Testcategorylist[] = this.appService.masterData.Testcategorylist;
    SelectedTestcategory: Testcategorylist | undefined;
    Assemblylist: Assemblylist[] = this.appService.masterData.Assemblylist;
    Selectedassembly: Assemblylist | undefined;
    TestModelist: TestModelist[] = this.appService.masterData.TestModelist;
    Selectedtestmode: TestModelist | undefined;
   devicefamilyList:any[] = [];
   devicefamilySelected:any = null;
   deviceList:any[] = [];
   deviceSelected:any | undefined;
   devicealiaslist:any[] = [];
   Selecteddevicealias:any | undefined;
   actualQty: any;
   currentQty: any;
   runningQty: any;
   unitsOnReel: boolean = false;
   iQAoptional: boolean = false;
   public categoryList = [
    { text: 'Package', value: 1 },
    { text: 'Wafer', value: 0 }
  ];
  public selectedCategory: number | undefined;
  public shipToList = [
    { text: 'FGI', value: 4 },
    { text: 'Customer', value: 7 },
    { text: 'Rel Storage', value: 10 },
    { text: 'T-Store', value: 12 }
  ];
  public selectedShipTo: { text: string; value: number } | undefined;
  public lotIdentifierList = [
    { id: 'Rel', name: 'Rel' },
    { id: 'Test', name: 'Test' },
    { id: 'Test&Rel', name: 'Test&Rel' },
    { id: 'TBD', name: 'TBD' }
  ];
  
  public selectedLotIdentifier: string | undefined;  
dateCode: any;
parttype: any;
custLot: any;
contactInfo: any;
missingQty: any;
scrapLot: any;
rturntoCust: any;
terminated: any;
  travellerDetails: any;
expedite: any;
public lotOwnersList: any[] = [];
public selectedLotOwner: any;
mergeLots: any[] = [];
isMergePopupVisible = false;
selectedMergeItem: any = null;
mergeMessage = '';
isLoadingMergeLots = false;
selectedMergeLots: any[] = [];
selectedMergeLotIds: number[] = [];
  matchedlots: any[] = [];
  showVoidSuccessDialog = false;
  showVoidButton: boolean = false;
  showMergeConfirmDialog : boolean = false;
  showMergeSuccessDialog : boolean = false;
  showSplitUnavailableDialog : boolean = false;
  isSplitPopupVisible: boolean = false;
  isLoadingSplitBins: boolean = false;
  selectedServiceId: number = 0;
  splitBins: any[] = [];
  originalSplitBins:any[] = [];
  originalFutureSplitBins:any[] = [];
  pivotedData: any[] = [];
  futurePivotedData: any[] = [];
  tempFuturePivotedData: any[] = [];
  splitColumns: string[] = [];
  futureSplitColumns: string[] = [];
  splitreadonlyColumns: string[] = [];
  futureSplitBins: any[] = [];
   yesNoOptions = [
    { text: 'Yes', value: true },
    { text: 'No', value: false }
  ];
  trvStepId: number = 0;
  splitTypes: any[] = [];
  futureSplitTypes:any[] = [];
  selectedSplitType: any = {};
  futureSelectedSplitType: any = {};
  isProcessedSplit: boolean = false;
  isFutureProcessedSplit: boolean = false;
  isBinExists: boolean = false;
  isFutureBinExists: boolean = false;
  isRecordModified: boolean = false;
  editFS: boolean = false;
  currentSplitData:any = {};
  previousSplitData:any = {};
  footerSplitRow:any = {};
  currentFutureSplitData:any = {};
  excludedKeys:any=['Id','binId',"Description","CopySteps","CopyShipping",'condition','Total', 'FSId'];
  splitIds: number[] = [];
    readonly ICON = ICON;
    isHideSplitVisible=false;
    isHideFutureSplitVisible = false;
  constructor(public appService: AppService, private apiService: ApiService,private cdr: ChangeDetectorRef) {  }

  ngOnInit(): void {
    this.init();
    this.getLotOwners();
    this.subscription.add(this.appService.sharedData.traveller.eventEmitter.subscribe((v) => {
      if (v === 'closeDialog') {
        this.closeDialog();
      }
    }));

  }
  init() {
    alert(this.customers);  
    const traveller = this.appService.sharedData.traveller;
    if(this.appService.sharedData.traveller.isEditMode || this.appService.sharedData.traveller.isViewMode){
        this.getTravellerDetails(this.appService.sharedData.traveller.dataItem.lotId);
      }
    }
    getTravellerDetails(lotId:number)  {
      this.apiService.getInventoryLot(lotId,'Traveler').subscribe({
        next : (data:any) => {
          this.travellerDetails = data;
          const steps = data?.trvSteps ?? [];
          this.gridDataResult = {
            data: steps,
            total: steps.length
          };
          this.bindMailRoomDetail();
        },
        error: (err) => {
          console.error('Failed to load traveler details:', err);
      this.gridDataResult = { data: [], total: 0 };
        }
      })
    }
    getStatusColor(status: string): string {
      if (!status) return '';
      switch (status.toLowerCase()) {
        case 'completed':
        case 'ready':
        case 'in progress':
        case 'approved':
          return 'status-green';
        case 'draft':
          return 'status-yellow';
        case 'pending approval':
          return 'status-red';
        default:
          return '';
      }
    }
    bindMailRoomDetail(){
      this.lotNumber = this.travellerDetails.iseLotNumber;
      this.customerSelected = this.customers.find(c => c.CustomerID === this.travellerDetails.customerId);
      this.selectedCategory = this.travellerDetails.isPackage? 1 : 0;
      this.getDeviceFamiliesList(this.customerSelected!.CustomerID);
      this.devicefamilySelected = this.devicefamilyList.find(c => c.deviceFamilyId === this.travellerDetails.deviceFamilyId);
      this.Selectedtestmode =this.TestModelist.find(c => c.masterListItemId === this.travellerDetails.dataCategoryId);
      this.deviceSelected = this.deviceList.find(c => c.deviceId === this.travellerDetails.deviceId);
      this.Selecteddevicealias = this.devicealiaslist.find(c => c.aliasId === this.travellerDetails.deviceAliasId);
      this.actualQty =this.travellerDetails.ourCount;
      this.runningQty= this.travellerDetails.currentCount;
      this.currentQty=this.travellerDetails.runningCount;
       this.selectedShipTo = this.shipToList.find(c => c.value === this.travellerDetails.shipLocation);
       this.dateCode=this.travellerDetails.dateCode;
       this.parttype = this.travellerDetails.partType;
       this.custLot = this.travellerDetails.customerLotNumber;
       this.contactInfo = this.travellerDetails.contactInfo;
       this.missingQty = this.travellerDetails.lotMissingQty;
       this.unitsOnReel = this.travellerDetails.unitsOnReel;
       this.scrapLot = this.travellerDetails.shipToScrap;
       this.expedite = this.travellerDetails.expedite;
       this.terminated = this.travellerDetails.isClosed;
       this.iQAoptional = this.travellerDetails.iqaNotRequired;
       this.Selectedtestmode = this.TestModelist.find(c => c.masterListItemId === this.travellerDetails.dataCategoryId);
       this.selectedShipTo = this.shipToList.find(c => c.value === this.travellerDetails.shipLocation);
       this.SelectedlotType = this.lotTypelist.find(c => c.masterListItemId === this.travellerDetails.deviceTypeId);
       this.Selectedcoo = this.Coolist.find(c => c.masterListItemId === this.travellerDetails.cooId);
       this.SelectedTestcategory = this.Testcategorylist.find(c => c.masterListItemId === this.travellerDetails.deviceTypeId);
       this.Selectedassembly = this.Assemblylist.find(c => c.masterListItemId === this.travellerDetails.assemblyId);
       this.selectedLotOwner = this.lotOwnersList.find(c => c.ownerId === this.travellerDetails.iseOwnerId);
       this.selectedServiceId = this.travellerDetails.serviceId;
      this.cdr.detectChanges();
    }
   onMergeClick(dataItem: any): void {
  this.selectedMergeItem = dataItem;
  this.isMergePopupVisible = true;
  this.fetchMergeLotsAndMatched(dataItem.lotId, dataItem.trvStepId); 
}

fetchMergeLotsAndMatched(lotId: number, trvStepId: number): void {
  this.mergeLots = [];
  this.selectedMergeLots = [];
  this.mergeMessage = '';
  this.isLoadingMergeLots = true;

  // Step 1: Fetch merge lots
  this.apiService.getMergeLots(lotId).subscribe({
    next: (mergeResponse) => {
      this.isLoadingMergeLots = false;

      if (mergeResponse && mergeResponse.length > 0) {
        this.mergeLots = mergeResponse;
        console.log("1stresult", this.mergeLots)

        // Step 2: Fetch matched lots
        this.apiService.getMatchedLots(trvStepId).subscribe({
          next: (matchedResponse) => {
            this.matchedlots = matchedResponse;
            const matchedLotIds: number[] = [];
            if(this.matchedlots.length>0){
              this.showVoidButton = false;
            }
            matchedResponse?.forEach(record => {
              if (record?.mergedLotIds) {
                const ids: number[] = record.mergedLotIds
                  .split(',')
                  .map((id: string) => parseInt(id.trim(), 10))
                  .filter((id: number) => !isNaN(id));
                matchedLotIds.push(...ids);
              }
            });

            this.selectedMergeLots = this.mergeLots.filter(ml =>matchedLotIds.includes(ml.lotId));
            this.selectedMergeLotIds = this.selectedMergeLots.map(item => item.lotId);
          },
          error: (err) => {
            console.error('Error fetching matched lots', err);
          }
        });

      } else {
        this.mergeMessage = 'There is no matching record available.';
      }
    },
    error: (err) => {
      this.isLoadingMergeLots = false;
      this.mergeMessage = 'Error fetching merge lots.';
      console.error(err);
    }
  });
}
onLotSelectionChange(event: SelectionEvent): void {
  const selectedId = event.selectedRows?.[0]?.dataItem?.lotId;
  const deselectedId = event.deselectedRows?.[0]?.dataItem?.lotId;

  if (selectedId != null && !this.selectedMergeLotIds.includes(selectedId)) {
    this.selectedMergeLotIds.push(selectedId);
  }

  if (deselectedId != null) {
    this.selectedMergeLotIds = this.selectedMergeLotIds.filter(id => id !== deselectedId);
  }

}
onVoidMerge(): void {
  const mergeId = this.matchedlots[0].mergeId; 
  const trvStepId = this.selectedMergeItem.trvStepId;
  const userId = this.appService.loginId;

  const payload = {
    mergeId,
    trvStepId,
    lotIds: '', // <-- Pass null/empty to void
    userId
  };

  this.apiService.addOrUpdateMerge(payload).subscribe({
    next: (returnCode) => {
      if (returnCode > 0) {
         this.showVoidSuccessDialog = true;
      } else {
        this.appService.errorMessage('Void failed.');
      }
    },
    error: (err) => {
      console.error('Void merge error:', err);
    }
  });
}
onVoidDialogClose(): void {
  this.showVoidSuccessDialog = false;
   this.isMergePopupVisible = false; 
}
onRequestMerge(): void {
  this.showMergeConfirmDialog = true;
}
onMergeConfirm(): void {
  this.showMergeConfirmDialog = false; 
  this.performMerge();
}
onMergeCancel(): void {
  this.showMergeConfirmDialog = false; 
}
performMerge(): void {
const mergeId = this.matchedlots?.[0]?.mergeId ?? null;
  const trvStepId = this.selectedMergeItem.trvStepId;
  const lotIds = this.selectedMergeLotIds.join(',');
  const userId = this.appService.loginId;

 const payload = {
    mergeId,
    trvStepId,
    lotIds,
    userId
  };

  this.apiService.addOrUpdateMerge(payload).subscribe({
    next: (returnCode) => {
      if (returnCode > 0) {
        this.showMergeSuccessDialog = true;
      } else {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
    },
    error: (err) => {
      console.error('Merge error:', err);
    }
  });
}
onSuccessDialogClose(): void {
  this.showMergeSuccessDialog = false;
  this.isMergePopupVisible = false;
}

onSplitClick(dataItem: any): void {
  this.splitBins = [];
  this.originalSplitBins = [];
  this.pivotedData = [];
  this.futureSplitBins = [];
  this.originalFutureSplitBins = [];
  this.futurePivotedData = [];
   this.isHideFutureSplitVisible = false;
   this.isHideSplitVisible = false;
  if(dataItem.showFS == 0 && dataItem.editFS == 0){
    this.isHideFutureSplitVisible = true;
  }
  if(dataItem.splitAvailable == 0 && dataItem.editSplit == 0){
    this.isHideSplitVisible = true;
  }
 this.handleSplit(dataItem);
}
closeSplitUnavailableDialog(): void {
  this.showSplitUnavailableDialog = false;
}
handleSplit(dataItem: any): void {
 
  this.splitBins = [];
  this.originalSplitBins = [];
  this.pivotedData = [];
  this.futureSplitBins = [];
  this.originalFutureSplitBins = [];
  this.futurePivotedData = [];
  this.selectedServiceId = dataItem.serviceId;
  this.trvStepId = dataItem.trvStepId;
  this.apiService.getSplitBins(dataItem.lotId, dataItem.trvStepId, false).subscribe(data=>{
   
    if(data.length > 0 && (dataItem.splitAvailable || dataItem.editSplit)){
      this.splitBins = data;
      this.originalSplitBins = data;
      this.pivotData();
      this.apiService.getSplits(this.trvStepId).subscribe(splits=>{
        if(splits.length){
          this.isSplitPopupVisible = true;
          splits.forEach(split=>{            
              const result: any = {};
              result["Id"] = split.splitId;
              result["Description"] = 'Split';
              result["CopySteps"] = split.isCopySteps;
              result["CopyShipping"] = split.isCopyShippingInfo;
              var values: any = {};
                split.bins.splitBins.forEach((bin:any) => {
                  var desc = this.originalSplitBins.find(s=>s.condition == bin.condition && Number(s.binId ?? 0) == Number(bin.binId ?? 0));
                  if(bin?.condition?.toLowerCase() == 'unprocessed' || bin?.condition?.toLowerCase() == 'processed'){
                      if(bin?.condition?.toLowerCase() == 'unprocessed' && Number(bin?.splitQty || 0) > 0){
                          result["SplitType"] = 'unprocessed';                    
                      }
                      else if(bin?.condition?.toLowerCase() == 'processed' && Number(bin?.splitQty || 0) > 0){
                          result["SplitType"] = 'processed';                    
                      }
                  }
                  values[desc?.description] = { "SplitQty": bin?.splitQty ?? 0 , "Description": desc?.description, "Condition":bin.condition, "BinId": Number(bin?.binId || 0) ?? 0 }
                    
                });

              result["values"] = values;
              
              this.pivotedData = [...this.pivotedData,result];
            

          });
          
            //this.pivotedData = [...this.pivotedData];
        }
      });
    }
    
    this.apiService.getFutureSplitBins(dataItem.trvStepId).subscribe(futureData=>{
      if(futureData.length > 0 && (dataItem.showFS || dataItem.editFS)){
        this.futureSplitBins = futureData;
        this.originalFutureSplitBins = futureData;
        this.pivotFutureSplitData();
        this.apiService.getFutureSplits(dataItem.trvStepId).subscribe(futureSplits=>{
          
            if(futureSplits.length){
              this.isSplitPopupVisible = true;
              futureSplits.forEach(split=>{
                  const result: any = {};
                  result["Id"] = split.totalSplits[0].splitId;
                  result["FSId"] = split.fsId;
                  result["CopySteps"] = split.totalSplits[0].isCopySteps;
                  result["CopyShipping"] = split.totalSplits[0].isCopyShippingInfo;
                  var values: any = {};
                  if(split.totalSplits.length){
                    
                    split.totalSplits[0].bins.splitBins.forEach((bin:any) => {
                      var desc = this.originalFutureSplitBins.find(s=>s.condition == bin.condition && Number(s.binId ?? 0) == Number(bin.binId ?? 0));
                      if(bin?.condition?.toLowerCase() == 'unprocessed' || bin?.condition?.toLowerCase() == 'processed'){
                        if(bin?.condition?.toLowerCase() == 'unprocessed' && Number(bin?.splitQty || 0) > 0){
                            result["SplitType"] = 'unprocessed';                    
                        }
                        else if(bin?.condition?.toLowerCase() == 'processed' && Number(bin?.splitQty || 0) > 0){
                            result["SplitType"] = 'processed';                    
                        }
                      }
                      values[desc?.description] = { "SplitQty": bin?.splitQty ?? 0 , "Description": desc?.description, "Condition":bin.condition, "BinId": Number(bin?.binId || 0) ?? 0  }
                  });
                    result["values"] = values;
                    result["IsDeleted"]= false;
                  }
                  
                    this.futurePivotedData = [...this.futurePivotedData, result];
              });
          }
        });
      }
    });
  });
  
  this.isSplitPopupVisible = true;;
}
  onCustomerChange(selectedCustomer: any) {
    if (!selectedCustomer && !selectedCustomer.CustomerID) return;
  
    const customerId = selectedCustomer.CustomerID;
    this.getDeviceFamiliesList(customerId);
  }

  getDeviceFamiliesList(customerId: number) {
    this.apiService.getDeviceFamiliesList(customerId).subscribe({
      next: (data: any[]) => { 
        this.devicefamilyList = Array.isArray(data) ? data : []; 
      },
      error: (err) => {
        console.error('Error fetching device families:', err);
        this.devicefamilyList = [];
      }
    });
  }
onDeviceFamilyChange(selectedDeviceFamily: any) {
    const customerId = this.customerSelected?.CustomerID; 
    if (customerId && selectedDeviceFamily) {
      this.getDeviceList(customerId, selectedDeviceFamily.deviceFamilyId);
    } else {
      this.deviceList = []; 
    }
  }
  getDeviceList(customerId: number, deviceFamilyId: number) {
    this.apiService.getDeviceList(customerId, deviceFamilyId).subscribe(
      (data: any[]) => {
        this.deviceList = Array.isArray(data) ? data : []; 
      },
      (error) => {
        console.error('Error fetching device list:', error);
        this.deviceList = []; 
      }
    );
  }
  onDeviceChange(selectedDevice: any) {
    const customerId = this.customerSelected?.CustomerID; 
    const devicefamilyId = this.devicefamilySelected?.deviceFamilyId;
    if (customerId && devicefamilyId && selectedDevice) {
      this.getDeviceAliasList(customerId, devicefamilyId,selectedDevice?.deviceId);
    } else {
      this.devicealiaslist = []; 
    }
  }
  getDeviceAliasList(customerId: number, deviceFamilyId: number,deviceId: number) {
    this.apiService.getDeviceAlias(customerId, deviceFamilyId,deviceId).subscribe(
      (data: any[]) => {
        this.devicealiaslist = Array.isArray(data) ? data : []; 
      },
      (error) => {
        console.error('Error fetching device list:', error);
        this.devicealiaslist = []; 
      }
    );
  }
  getLotOwners() {
    this.apiService.getLotOwners().subscribe({
      next: (data: any[]) => { 
        this.lotOwnersList = Array.isArray(data) ? data : []; 
      },
      error: (err) => {
        console.error('Error fetching list:', err);
        this.lotOwnersList = [];
      }
    });
  }
  closeDialog() {
    this.isDialogOpen = false;
    this.appService.eventEmitter.emit({ action: 'refreshVendors', data: { m: 'masterData' } })
  }
      onCellClick(e: CellClickEvent): void {
        if (e.type === 'contextmenu') {
          //this.showContextMenu(e);
        } else {
          if (e.type == 'click') {
            if (['Mac', 'iOS'].includes(this.appService.deviceDetectorService.getDeviceInfo().os)) {
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
      addRow() {
        this.isBinExists = false;
        this.isFutureBinExists = false;
        if(this.splitTypes.length > 1)
        {
            if(this.selectedSplitType.value == 0){
              alert("Please select Split Type.");
              return;
            }
        }
        if(Number(this.pivotedData.filter(row => row.Id > 0 && row.values["Total"].Total >= 0)     
                        .map(row => row.values["Total"].SplitQty)            
                        .reduce((sum, val) => sum + val, 0)) > Number(this.originalSplitBins.filter(o=>o["qty"] > 0 && o["condition"] == "Total").
                                                                map(row=>row["qty"]).reduce((sum, val) => sum + val, 0))){
          alert("Can't add a new row because there is no available quantity.")
          return;
        }
        if(Object.keys(this.currentSplitData).length > 0 && this.currentSplitData.values["Total"].SplitQty  === 0){
          alert("Please enter Split(s)");
          return;
        }
        const result: any = {};
        result["Id"] = this.pivotedData.length + 1;
        result["Description"] = "Split";
        result["CopySteps"] = true;
        result["CopyShipping"] = false;
        var values: any = {};
        this.splitBins.forEach(item => {
            values[item.description] = { "SplitQty": item.splitQty ?? 0, "Description": item.description, "Condition":item.condition, "BinId": Number(item.binId || 0) ?? 0 }
            
        });
        result['SplitType'] =  this.selectedSplitType?.text.toLowerCase().includes('un-processed') ? "unprocessed" : "processed";
        result["values"] = values;
        this.currentSplitData = result;
        this.pivotedData = [...this.pivotedData, result];
        this.isRecordModified = true;
        this.splitTypeChange();
      }

      pivotData() {
        this.splitColumns = [];
        this.isRecordModified = false;
        this.splitTypes = [];
        const result: any = {};
        var total = 0;
        var unProcessed = 0;
        result["Id"] = 0;
        result["Description"] = 'Split';
        result["CopySteps"] = '';
        result["CopyShipping"] = '';
        var values:  any = {};
        this.splitBins.forEach(item => {
          
         values[item.description] = { "SplitQty": item.qty ?? 0, "Description": item.description, "Condition":item.condition, "BinId": Number(item.binId || 0) ?? 0 }
         result['splitType'] = '';
         let splitType = {};
          if(item.binId > 0)
            this.isBinExists = true;
          switch(item.condition){
                case "Total":
                   total = item.qty;
                   break;
                case "UnProcessed":
                  if(item.qty){
                    this.splitTypes.push({ text: "Un-Processed Quantity", value: 1 });
                    splitType = { text: "Un-Processed Quantity", value: 1 };
                  }
                  break;
                case "Processed":
                  if(item.qty > 0){
                    this.splitTypes.push({ text: "Processed Quantity", value: 2 }); 
                    splitType = { text: "Processed Quantity", value: 2 };
                  }
                  break;        
            }
            
            if(Object.keys(splitType).length > 0)
              this.selectedSplitType = splitType;
        });
         result["values"] = values;
            if(this.splitTypes.length > 1){
              this.splitTypes.splice(0,0, { text: "--Select--", value: 0 } );
              this.splitTypes = [...this.splitTypes];
              this.selectedSplitType = { text: "--Select--", value: 0 };
            }   
        this.pivotedData = [result];
        this.splitColumns.push(...Object.keys(result).filter(k => k !== 'values'));
        this.splitColumns.push(...Object.keys(result.values));
        this.splitColumns = this.splitColumns.filter(s=>s != "Id" && s != 'binId' && s != 'condition' && s!= 'splitType');
        this.splitColumns.forEach(col => {
          if (col === 'Description') {
            this.footerSplitRow[col] = 'Available Qty';
          } else if(col == "Total") {
            this.footerSplitRow["Total"] = total;
          }
        });
        this.splitreadonlyColumns = [...this.splitColumns];         
      }

    deleteRow(row: any, splitType: string) {
      if(splitType === 'Split'){
        this.currentSplitData = {};
        this.pivotedData = this.pivotedData.filter(r => r !== row);
      }else if(splitType === "FutureSplit"){
        this.currentFutureSplitData = {};
        this.tempFuturePivotedData.push(row);
        if(Number(row.values["Total"].SplitQty || 0) == 0){
          this.futurePivotedData = this.futurePivotedData.filter(r => r !== row);
         
        }else{
          row.IsDeleted = true;
        }
      }
      
    }

    bindSplitTotal(dataItem:any, col:string){
        if(this.splitTypes.length > 1)
        {
            if(this.selectedSplitType == 0){
              alert("Please select Split Type.");
              return;
            }
        }
        this.mapSplitData(dataItem, col); 
        if(!this.validateSplitTotal('Split')){
            
            alert("Entered Quantity Should not greater than the Available Quantity.");

        } else{
          
          
          this.currentSplitData = dataItem;       
          
        }
    }

    bindFutureSplitTotal(dataItem:any, condition:string){
     
      var oldItem = dataItem;
      
      
      var total = this.futurePivotedData.filter(row => row.values["Total"].SplitQty > 0)     
                        .map(row => row.values["Total"].SplitQty)            
                        .reduce((sum, val) => sum + val, 0); 
       if(this.futureSplitTypes.length > 1)
       {
            if(this.futureSelectedSplitType.value == 0){
              alert("Please select Split Type.");
              return;
            }
        } 
               
      if(total > this.currentQty){
         alert("Total/Entered Quantity Should not greater than the Running Quantity.");
        
         return false;    
      }else if(total == this.currentQty && dataItem[condition] == undefined){
        alert("Cannot add a new row because it exceeds the Running Quantity.");
        return false;
      }
       this.mapFutureSplitData(dataItem);
      if(!this.validateSplitTotal('FutureSplit')){
            
            alert("Total/Entered Quantity Should not greater than the Running Quantity.");

        } else{
         
          this.currentFutureSplitData = dataItem; 
        }
      
      return true;
    }

    mapSplitData(dataItem:any, col:string){
      dataItem.values["Total"].SplitQty = 0;
       if (dataItem.values?.["binId"] > 0) {
          ["Good", "Reject"].forEach(key => {
            if (dataItem.values?.[key]) {
              dataItem.values[key].SplitQty = 0;
            }
          });
        }
      Object.keys(dataItem.values).forEach(key => {
        if(this.originalSplitBins.some(o=>o.description == key && (o.condition == 'UnProcessed'))){
          dataItem.values["Total"].SplitQty += dataItem.values[key].SplitQty;
        }
        if(this.originalSplitBins.some(o=>o.description == key && (o.condition == 'Good' || o.condition == 'Pass') && (Number(o.binId) || 0) > 0)){
          dataItem.values["Good"].SplitQty += dataItem.values[key].SplitQty;
          dataItem.values["Total"].SplitQty += dataItem.values[key].SplitQty;
          if (dataItem.values?.["Processed"]) {
            dataItem.values["Processed"].SplitQty = dataItem.values["Total"].SplitQty;
          }
        }
        if(this.originalSplitBins.some(o=>(o.description == key && o.condition == 'Reject') || (o.description == key && o.condition == 'Good')  && (Number(o.binId) || 0) > 0)){
          dataItem.values["Total"].SplitQty += dataItem.values[key].SplitQty;
          if (dataItem.values?.["Processed"]) {
            dataItem.values["Processed"].SplitQty = dataItem.values["Total"].SplitQty
          }
        }
      });
      
    }

    mapFutureSplitData(dataItem:any){
      dataItem.values["Total"].SplitQty = 0;
      if (dataItem.values?.["binId"] > 0) {
        ["Good", "Reject"].forEach(key => {
          if (dataItem.values?.[key]) {
            dataItem.values[key].SplitQty = 0;
          }
        });
      }
      Object.keys(dataItem.values).forEach(key => {
        if(this.originalFutureSplitBins.some(o=>o.description == key && (o.condition == 'UnProcessed'))){
          dataItem.values["Total"].SplitQty += dataItem.values[key].SplitQty;
        }
        if(this.originalFutureSplitBins.some(o=>o.description == key && (o.condition == 'Good' || o.condition == 'Pass') && (Number(o.binId) || 0) > 0)){
          dataItem.values["Good"].SplitQty += dataItem.values[key].SplitQty;
          dataItem.values["Total"].SplitQty += dataItem.values[key].SplitQty;
          if (dataItem.values?.["Processed"]) {
            dataItem.values["Processed"].SplitQty = dataItem.values["Total"].SplitQty;
          }
        }
        if(this.originalFutureSplitBins.some(o=>o.description == key && o.condition == 'Reject' && (Number(o.binId) || 0) > 0)){
        
          dataItem.values["Reject"].SplitQty += dataItem.values[key].SplitQty;
          dataItem.values["Total"].SplitQty += dataItem.values[key].SplitQty;
          if (dataItem.values?.["Processed"]) {
            dataItem.values["Processed"].SplitQty = dataItem.values["Total"].SplitQty;
          }
        }else if(this.originalFutureSplitBins.some(o=>(o.description == key && o.condition == 'Reject') || (o.description == key && o.condition == 'Good') && (Number(o.binId) || 0) == 0)){
          dataItem.values["Total"].SplitQty += dataItem.values[key].SplitQty;
          if (dataItem.values?.["Processed"]) {
            dataItem.values["Processed"].SplitQty = dataItem.values["Total"].SplitQty;
          }
        }
      });
    }

    validateSplitTotal(splitType:string){
      if(splitType == "Split"){
        if((!this.isProcessedSplit)){
          var originalTotal = this.pivotedData.filter(p=>p.Id == 0)[0];
          var splitTotal = this.pivotedData.filter(row => row.Id > 0)     
                          .map(row => row.values["Total"].SplitQty)            
                          .reduce((sum, val) => sum + val, 0);         
          if(splitTotal > 0 && Number(splitTotal) > Number(originalTotal.Total)){
            return false;
          }
        }else if(this.isProcessedSplit){
          var splitTotal = this.pivotedData.filter(row => row.Id > 0)     
                          .map(row => row.values["Total"].SplitQty)            
                          .reduce((sum, val) => sum + val, 0); 
          if(splitTotal > 0 && splitTotal > this.currentQty){
            return false;
          }
        }
      }else if(splitType == "FutureSplit"){
        var total = this.futurePivotedData.filter(row => row.values["Total"].SplitQty > 0)     
                        .map(row => row.values["Total"].SplitQty)            
                        .reduce((sum, val) => sum + val, 0); 
        if(total > this.currentQty){
          alert("Total/Entered Quantity Should not greater than the Running Quantity.");
          
          return false;    
        }
      }
      return true;
    }
    saveSplit() {
      var requestData = { "userId" : this.appService.loginId, "trvStepId": this.trvStepId, "addOrUpdateSplits" : this.pivotedData.filter(p=> p.Id > 0) };
      if(this.currentSplitData["Total"] === 0){
          alert("Please enter Split(s)");
          return;
      }
      if(!this.validateSplitTotal('Split')){
            alert("Entered Quantity Should not greater than the Available Quantity.");
      }else{
        this.apiService.addOrUpdateSplit(requestData).subscribe(data=>{
          if(data){
            this.isSplitPopupVisible = false;
            alert("Updated Successfully.");
          }
        });
      }
    }

    saveFutureSplit(){
      if(this.currentFutureSplitData["Totals"] == 0){
        alert("Please enter Split(s)");
          return;
      }
      if(!this.validateSplitTotal('FutureSplit')){
         
        }else{
          var requestData = { "userId" : this.appService.loginId, "trvStepId": this.trvStepId, "addOrUpdateSplits" : this.futurePivotedData };
          this.apiService.addOrUpdateFutureSplit(requestData).subscribe(data=>{
            if(data){
              this.isSplitPopupVisible = false;
              alert("Updated Successfully.");
            }
        });
      }
    }

    addFutureRow() {
      this.isBinExists = false;
      this.isFutureBinExists = false;
       if(this.futureSplitTypes.length > 1)
       {
            if(this.futureSelectedSplitType.value == 0){
              alert("Please select Split Type.");
              return;
            }
        }  
        const result: any = {};        
        result["Id"] = this.futurePivotedData.length + 1;
        result["FSId"] = 0;
        result["CopySteps"] = true;
        result["CopyShipping"] = false;
        var values: any = {};
        this.futureSplitBins.forEach(item => {
          values[item.description] = { "SplitQty": item.splitQty ?? 0, "Description": item.description, "Condition":item.condition, "BinId": Number(item.binId || 0) ?? 0 }
        });
        result['SplitType'] = (this.futureSelectedSplitType?.text || '').toLowerCase().includes('un-processed') ? 'unprocessed' : 'processed';
       
        result["values"] = values;
        result["IsDeleted"] = false;
        this.currentFutureSplitData = result;
        if(this.bindFutureSplitTotal(result, '')){
          this.futurePivotedData = [...this.futurePivotedData, result];
        }
      }
     pivotFutureSplitData() {
      this.futurePivotedData = []
      this.futureSplitTypes = [];
        this.futureSplitColumns = [];
        const result: any = {};
        var total = 0;
        var processed  = 0;
        result["Id"] = 0;
        result["FSId"] = 0;
        result["CopySteps"] = '';
        result["CopyShipping"] = '';
        var values: any = {};
        this.futureSplitBins.forEach(item => {
         values[item.description] = { "SplitQty": item.splitQty ?? 0, "Description": item.description, "Condition":item.condition, "BinId": Number(item.binId || 0) ?? 0 }
         let splitType = {};
          if(item.binId > 0)
            this.isFutureBinExists = true;
          switch(item.condition){
               
                case "UnProcessed":
                  if(item.qty){
                    this.futureSplitTypes.push({ text: "Un-Processed Quantity", value: 1 });
                    splitType = { text: "Un-Processed Quantity", value: 1 };
                  }
                  break;
                case "Processed":
                  if(item.qty > 0){
                    processed = item.qty;
                    this.futureSplitTypes.push({ text: "Processed Quantity", value: 2 }); 
                    splitType = { text: "Processed Quantity", value: 2 };
                    this.isFutureProcessedSplit = true;
                  }
                  break;        
            }
            
             
            this.futureSelectedSplitType = splitType;
        });
        values['splitType'] =  this.futureSelectedSplitType?.text?.toLowerCase().includes('un-processed') ? "unprocessed" : "processed";
        result['values'] = values;
        result["IsDeleted"] = false;
        if(this.futureSplitTypes.length > 1){
              this.futureSplitTypes.splice(0,0, { text: "--Select--", value: 0 } );
              this.futureSplitTypes = [...this.futureSplitTypes];
        } 
         this.futureSplitColumns.push(...Object.keys(result).filter(k => k !== 'values'));
        this.futureSplitColumns.push(...Object.keys(result.values));
        this.futureSplitColumns = this.futureSplitColumns.filter(s=>s != 'Id' && s != 'FSId' && s != 'binId' && s != 'condition' && s!= 'IsDeleted' && s!= 'splitType');
   }
      
      isTextboxDisabled(
  col: string,
  dataItem: any,
  splitType: string
): boolean {
  if (!dataItem || !dataItem.values || !dataItem.values[col]) {
    return true; // disable if column data is missing
  }
  console.log(dataItem.SplitType);
  const desc = dataItem.values[col]?.Description || '';
  const condition = (dataItem.values[col]?.Condition || '').toLowerCase();
  const binId = Number(dataItem.values[col]?.BinId || 0);
  const selectedText = dataItem.SplitType == undefined ? '' : dataItem.SplitType;

  // Rule 1: Disable Total, Processed with serviceId=2, or Processed with FutureSplit
  if (condition === 'total') {
    return true;
  }

  // Rule 2: Good/Reject with BinId == 0
  if ((condition === 'good' || condition === 'pass' || condition === 'reject') && binId === 0) {
    if (selectedText == 'unprocessed' || 
        (selectedText == 'processed' && this.isBinExists && splitType=='Split') ||
        (selectedText == 'processed' && this.isFutureBinExists && splitType == 'FutureSplit')) {

      return true;
    }
  }
// Rule 3: UnProcessed then 
  if ((condition === 'good' || condition === 'pass' || condition === 'reject') && binId > 0) {
    if (selectedText == 'unprocessed') {
      
      return true;
    }
  }

  // Rule 4: Missing
  if (condition === 'missing') {
    return true;
  }

  // Rule 5: UnProcessed but Processed > 0
  if (condition === 'unprocessed' && (selectedText == 'processed')) {
    
    return true;
  }

  if(condition == 'processed'){
    return true;
  }

  

  

  return false;
}


     

      getSplitTotal(field: string): number {
          if (!this.pivotedData.length) return 0;

          // Example: take max value in column as "limit"
          const maxValue = Math.max(...this.pivotedData.map(r => Number(r.values[field].SplitQty) || 0));

          // Remaining = max value - current total (or any logic you want)
          const total = this.pivotedData.reduce((sum, r) => sum + (Number(r.values[field].SplitQty) || 0), 0);

          // If you want remaining never negative
          return Math.max(0, maxValue - total + maxValue);
      }

      splitTypeChange(){
       if(this.splitTypes.length > 0 && Number(this.selectedSplitType.value) > 0){
           if(this.selectedSplitType.text == 'Processed Quantity'){
             this.isProcessedSplit = true;
           }else if(this.selectedSplitType.text == 'Un-Processed Quantity'){
           this.isProcessedSplit = false; 
           }
        }
      }

      futureSplitTypeChange(){
       if(this.futureSplitTypes.length > 0 && Number(this.futureSelectedSplitType.value) > 0){
           if(this.futureSelectedSplitType.text == 'Processed Quantity'){
             this.isFutureProcessedSplit = true;
           }else if(this.futureSelectedSplitType.text == 'Un-Processed Quantity'){
           this.isFutureProcessedSplit = false; 
           }
        }
      }

      get activeFuturePivotedData() {
        return this.futurePivotedData.filter(f => !f.IsDeleted);
      }

      getHeaderClass(field: string, type:string): string {
      if (type == 'Split') 
      {
        var headerData = this.originalSplitBins.find(s=>s.description == field);
        if(headerData?.condition?.toLowerCase() == 'good'||
           headerData?.condition?.toLowerCase() == 'pass')
           {
              return "splitFuture-grid-good";
           }else if(headerData?.condition?.toLowerCase() == 'reject'){
            return "splitFuture-grid-reject"
           }
      }
      if (type == 'FutureSplit') 
      {
        var headerData = this.originalFutureSplitBins.find(s=>s.description == field);
        if(headerData?.condition?.toLowerCase() == 'good'||
           headerData?.condition?.toLowerCase() == 'pass')
           {
              return "splitFuture-grid-good";
           }else if(headerData?.condition?.toLowerCase() == 'reject'){
            return "splitFuture-grid-reject"
           }
      }
      
      return "";
    }
}
 

