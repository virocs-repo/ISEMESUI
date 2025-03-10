import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileSelectComponent } from '@progress/kendo-angular-upload';
import { ApiService } from 'src/app/services/api.service';
import { ShippingAttachment, ICON, OperaterAttachments } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';
import { SelectEvent } from '@progress/kendo-angular-upload';

@Component({
  selector: 'app-add-hold',
  templateUrl: './add-hold.component.html',
  styleUrls: ['./add-hold.component.scss']
})
export class AddHoldComponent implements OnInit {
  @Output() dataUpdated = new EventEmitter<void>();
  @Input() lotNumber: string = '';
  @Input() location: string = '';
  @Input() noOfHolds: string = '';
  @Input() customerName: string = '';
  @Input() device: string = '';
  @Input() inventoryId: number = 0;
  @Output() cancel = new EventEmitter<void>();
  @Input() mode: string = 'add';
  @Input() selectedGridData: any;
  holdTypes: any[] = [];
  holdComment: string[] = [];
  isHold: boolean = true;
  selectedHoldType: any ={};
  selectedHoldCode: string = '';
  selectedHoldComment: string = '';
  holdComments: string = '';
  reason: string = '';
  offHoldComments: string = '';
  treeNodes: any[] = [];
  selectedIds: any[] = [];
  holdBy: string | null = null; 
  holdTime: string | null = null; 
  offHoldBy: string | null = null;
  offHoldTime: string | null = null;
  inventoryXHoldId: number| null = null;
  isReadOnly: boolean = false;
  isView: boolean = false;
  showHoldFields:boolean = false;
  fileToUpload: File[] = [];
  constructor(private appService: AppService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchHoldTypes();
    this.loadOperatorAttachments();
    this.listFiles();
   //this.fetchHoldComments();
   setTimeout(() => {
    if (this.mode === 'edit') {
      this.populateFields();
      this.isReadOnly = true;
    }
    if (this.mode === 'view') {
      this.populateFields();
      this.isView = true;
      this.isReadOnly = true;
      this.showHoldFields = true;
    }
    else if (this.mode === 'add') {
      this.resetForm();
      this.isHold = true;
      this.isView = false;
      this.isReadOnly = false;
    }
    //this.isReadOnly = !!this.offHoldComments;
  }, 500);
  }

  onHoldChanged(){
    this.showHoldFields = !this.isHold;
  }
 

  populateFields(): void {
    if (this.selectedGridData) {
      //this.selectedHoldType = this.holdTypes.find(e => e.holdType==  this.selectedGridData[0]?.holdType);
      this.holdComments = this.selectedGridData[0]?.holdComments || '';
      this.reason = this.selectedGridData[0]?.reason || '';
      this.offHoldComments = this.selectedGridData[0]?.offHoldComments || '';
      this.isHold = !this.offHoldComments;
      this.inventoryXHoldId = this.selectedGridData[0]?.inventoryXHoldId;
      this.holdBy = this.selectedGridData[0]?.createdBy || null;
      this.holdTime = this.selectedGridData[0]?.createdOn || null;
      this.offHoldBy = this.selectedGridData[0]?.offHoldBy || null;
      this.offHoldTime = this.selectedGridData[0]?.offHoldDate || null;
      this.selectedHoldCode = this.selectedGridData[0]?.holdCode || ''; 
      this.listFiles();
    }
    //this.isReadOnly = !!this.offHoldComments;
  }
  

  fetchHoldTypes(): void {
    this.apiService.getHoldType(this.inventoryId).subscribe(
      (response: any[]) => {
        this.holdTypes = response; 
        if (this.selectedGridData?.length > 0) {
          this.selectedHoldType = this.holdTypes.find(e=> e.holdType == this.selectedGridData[0].holdType);
        }
      },
      () => this.appService.errorMessage('Failed to fetch hold codes.')
    );
  }

  onHoldTypeChange(selectedItem: any): void {
    this.selectedHoldType.holdType = selectedItem.holdType;
    this.selectedHoldType.holdTypeId= selectedItem.holdTypeId;
    this.fetchHoldCodes();
  }
  
  fetchHoldCodes(): void {
    this.apiService.getHoldCodes(this.inventoryId,this.selectedHoldType.holdTypeId).subscribe(
      (response: any) => {
        this.treeNodes = response;
          if (this.mode === 'edit' && this.selectedHoldType.holdType && !this.holdTypes.includes(this.selectedHoldType.holdType)) {
          this.holdTypes.push(this.selectedHoldType);
        }
      },
      (error) => this.appService.errorMessage('Failed to load hold codes.')
    );
  }
  
  onSelectionChange(event: any): void {
    const selectedNode = event.dataItem;
    if (selectedNode && selectedNode.holdCode) {
      this.reason = selectedNode.holdCode;
      this.selectedIds.push(selectedNode.holdCodeId);
    } else {
      this.appService.errorMessage('Please select a valid Hold Code.');
    }
  }
  

  save(): void {
    if (!this.holdComments || !this.selectedHoldType ) {
      this.appService.errorMessage('Please fill in the required fields.');
      return;
    }
    if(this.mode === "edit" && !this.offHoldComments && !this.isHold){
      this.appService.errorMessage('Please fill Off Hold Comments');
      return;
    }
    var holdCodeId = 0;
    var groupName = null;
    if(this.mode=== "edit")
    {
      holdCodeId = this.selectedGridData[0].holdCodeId;
      groupName = this.selectedGridData[0].groupName;
    }
    else
    {
      holdCodeId = this.selectedIds.length>0?this.selectedIds[0]:null;
      groupName = this.treeNodes?.[2]?.groupName || null;
    }
    
    const payload = {
      InventoryXHoldId: this.inventoryXHoldId || null,
      InventoryId: this.inventoryId,
      Reason: this.reason,
      HoldComments: this.holdComments,
      HoldType: this.selectedHoldType.holdType,
      GroupName: groupName,
      HoldCodeId: holdCodeId,
      OffHoldComments: this.isHold ? null : this.offHoldComments,
      UserId: this.appService.loginId,
      CategoryName: 'Hold',
    };
    if(this.fileToUpload.length>0)
      {
        this.apiService.upsertInventoryHold(payload, { responseType: 'text' },this.fileToUpload).subscribe(
          () => {
            this.appService.successMessage('Hold details have been saved successfully!');
            this.dataUpdated.emit();
            this.cancel.emit();
            this.listFiles();
          },
          () => 
            {
              this.appService.errorMessage('Failed to save hold details.')
            }
        );

      } 
      else{
        this.apiService.upsertInventoryHold(payload, { responseType: 'text' }).subscribe(
          () => {
            this.appService.successMessage('Hold details have been saved successfully!');
            this.dataUpdated.emit();
            this.cancel.emit();
            this.listFiles();
          },
          () => 
            {
              this.appService.errorMessage('Failed to save hold details.')
            }
        );
      }
  }  

  resetForm(): void {
    this.isHold = true;
    this.selectedHoldType = '';
    this.holdComments = '';
    this.reason = '';
    this.offHoldComments = '';
    this.cancel.emit();
  }
  // For Attachements
  readonly ICON = ICON;
  isDisabled: any = {
    shipBtn: false,
    clearBtn: false
  }
  onUpload(event: SelectEvent): void {
    const formData = new FormData();
    event.files.forEach((files: any) => {
      this.fileToUpload.push(files.rawFile);
    });
  }

  shippingAttachments: ShippingAttachment[] = [];
  readonly downloadFileApi = environment.apiUrl + 'v1/ise/inventory/download/'
  uploadFilesById(upFiles: FileSelectComponent) {       
    if (!this.inventoryId) {
      return;
    }
    const files = upFiles.fileList.files;
    if (files && files.length) {
      const file = files[0][0].rawFile;
      if (!file) {
        this.appService.errorMessage('Error while selecting file');
        return;
      }
      const inputFilename = file.name.replace(/\.[^/.]+$/, '');
      const inventoryID = this.selectedGridData[0].inventoryXHoldId;    
      this.apiService.uploadFileByIds(file, inputFilename, inventoryID, this.appService.loginId,'Hold').subscribe({
        next: (v: any) => {
          this.appService.successMessage('Success: File uploaded!');
          upFiles.clearFiles();
            this.listFiles();
          },
          error: (v: any) => {
            this.appService.errorMessage('Error while uploading file')
        }
      });
    } else {
      this.appService.errorMessage('Please select file to upload')
    }
  }

  private listFiles() {
    if (!this.inventoryId) {
      return;
    }
    this.apiService.listFilesById(this.selectedGridData[0]?.inventoryXHoldId,'Hold').subscribe({
      next: (v: any) => {
        this.shippingAttachments = v;
      }
    })
  }

  downloadFile(d: ShippingAttachment) {
    this.apiService.downloadFile(d.path).subscribe();
  }
  deleteFile(d: ShippingAttachment) {
    d.active = false;
    this.apiService.deleteFile(d).subscribe({
      next: (v: any) => {
        this.appService.successMessage('Success: File deleted!')
        this.listFiles();
      },
      error: (v: any) => {
        this.appService.errorMessage('Error: Unable to delete file')
      }
    })
  }
  operaterAttachments: OperaterAttachments[] = [];
  loadOperatorAttachments() {
    this.apiService.getOperaterAttachments(this.selectedGridData[0]?.tfsHold).subscribe(
        (data) => {
            console.log("API Response:", data); // Debugging
            this.operaterAttachments = Array.isArray(data) ? data : [];
        },
        (error) => console.error("Error:", error)
    );
  }
}