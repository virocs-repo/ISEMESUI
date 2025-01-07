import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';

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
    this.fetchHoldCodes();
    this.fetchHoldTypes();
    this.fetchHoldComments();
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

  fetchHoldComments(): void {
    this.apiService.getHoldComments().subscribe(
      (response: any) => {
          this.holdComment = response.map((item: any) => item.holdComments);
          if (this.mode === 'edit' && this.selectedGridData?.length > 0) {
            this.selectedHoldComment = this.selectedGridData[0].holdComment || '';
          }
        },
      () => this.appService.errorMessage('Failed to fetch hold codes.')
    );
  }

  onSelectionChange(event: any): void {
    const selectedNode = event.dataItem;
    if (selectedNode) {
      this.reason = selectedNode.holdCode || selectedNode.groupName;
      this.selectedIds = [selectedNode.holdCodeId];
    }
  }  

  save(): void {
    
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
}