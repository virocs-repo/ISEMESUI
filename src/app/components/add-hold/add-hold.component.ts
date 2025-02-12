import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileSelectComponent } from '@progress/kendo-angular-upload';
import { ApiService } from 'src/app/services/api.service';
import { ShippingAttachment, ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';

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
  holdTypes: string[] = [];
  holdComment: string[] = [];
  isHold: boolean = true;
  selectedHoldType: string = '';
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
  constructor(private appService: AppService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.listFiles();
    this.fetchHoldCodes();
    this.fetchHoldTypes();
   //this.fetchHoldComments();
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
  }

  onHoldChanged(){
    this.showHoldFields = !this.isHold;
  }
 

  populateFields(): void {
    if (this.selectedGridData) {
      this.selectedHoldType = this.selectedGridData[0]?.holdType || '';
      this.holdComments = this.selectedGridData[0]?.holdComments || '';
      this.reason = this.selectedGridData[0]?.reason || '';
      this.offHoldComments = this.selectedGridData[0]?.offHoldComments || '';
      this.isHold = !this.offHoldComments;
      this.inventoryXHoldId = this.selectedGridData[0]?.inventoryXHoldId;
      this.holdBy = this.selectedGridData[0]?.createdBy || null;
      this.holdTime = this.selectedGridData[0]?.createdOn || null;
      this.offHoldBy = this.selectedGridData[0]?.offHoldBy || null;
      this.offHoldTime = this.selectedGridData[0]?.offHoldDate || null;
    }
    //this.isReadOnly = !!this.offHoldComments;
  }

  fetchHoldCodes(): void {
    this.apiService.getHoldCodes(this.inventoryId).subscribe(
      (response: any) => {
        this.treeNodes = response;
          if (this.mode === 'edit' && this.selectedHoldType && !this.holdTypes.includes(this.selectedHoldType)) {
          this.holdTypes.push(this.selectedHoldType);
        }
      },
      (error) => this.appService.errorMessage('Failed to load hold codes.')
    );
  }

  fetchHoldTypes(): void {
    this.apiService.getHoldType(this.inventoryId).subscribe(
      (response: any) => {
          this.holdTypes = response.map((item: any) => item.holdType);
          if (this.mode === 'edit' && this.selectedGridData?.length > 0) {
            this.selectedHoldType = this.selectedGridData[0].holdType || '';
          }
        },
      () => this.appService.errorMessage('Failed to fetch hold codes.')
    );
  }

 /* fetchHoldComments(): void {
    this.apiService.getHoldComments().subscribe(
      (response: any) => {
          this.holdComment = response.map((item: any) => item.holdComments);
          if (this.mode === 'edit' && this.selectedGridData?.length > 0) {
            this.selectedHoldComment = this.selectedGridData[0].holdComment || '';
          }
        },
      () => this.appService.errorMessage('Failed to fetch hold codes.')
    );
  }*/

  onSelectionChange(event: any): void {
    const selectedNode = event.dataItem;
    if (selectedNode) {
      this.reason = selectedNode.holdCode || selectedNode.groupName;
      this.selectedIds = [selectedNode.holdCodeId];
    }
  }  

  save(): void {
    if (!this.holdComments || !this.selectedHoldType || !this.reason ) {
      this.appService.errorMessage('Please fill in the required fields.');
      return;
    }
    const groupName = this.treeNodes?.[0]?.groupName || null;
    const payload = {
      InventoryXHoldId: this.inventoryXHoldId || null,
      InventoryId: this.inventoryId,
      Reason: this.reason,
      HoldComments: this.holdComments,
      HoldType: this.selectedHoldType,
      GroupName: groupName,
      HoldCodeId: 10,//this.selectedIds[0] || null,
      OffHoldComments: this.isHold ? null : this.offHoldComments,
      UserId: 1
    };
    this.apiService.upsertInventoryHold(payload, { responseType: 'text' }).subscribe(
      () => {
        this.appService.successMessage('Hold details have been saved successfully!');
        this.dataUpdated.emit();
        this.cancel.emit();
      },
      () => 
        {
          this.appService.errorMessage('Failed to save hold details.')
        }
    );
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
  onUpload(event: any): void {
    const formData = new FormData();
    event.files.forEach((file: any) => {
      formData.append('files', file.rawFile);
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
      const inventoryID = this.inventoryId;    
      this.apiService.uploadFileByIds(file, inputFilename, inventoryID, this.appService.loginId,'ShipAlert').subscribe({
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
    this.apiService.listFilesById(this.inventoryId,'ShipAlert').subscribe({
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
}