import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-add-hold',
  templateUrl: './add-hold.component.html',
  styleUrls: ['./add-hold.component.scss']
})
export class AddHoldComponent implements OnInit {
  @Input() lotNumber: string = '';
  @Input() location: string = '';
  @Input() noOfHolds: string = '';
  @Input() inventoryId: number = 0;
  @Output() cancel = new EventEmitter<void>();
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() selectedGridData: any;
  holdTypes: string[] = [];
  isHold: boolean = true;
  selectedHoldType: string = '';
  holdComments: string = '';
  reason: string = '';
  offHoldComments: string = '';
  treeNodes: any[] = [];
  selectedIds: any[] = [];
  holdBy: string | null = null; 
  holdTime: string | null = null; 
  offHoldBy: string | null = null;
  offHoldTime: string | null = null;

  constructor(private appService: AppService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchHoldCodes();
    if (this.mode === 'edit') {
      this.populateFields();
    }
    else{
      this.resetForm();
    }
  }
  

  populateFields(): void {
    if (this.selectedGridData) {
      this.selectedHoldType = this.selectedGridData[0].holdType || '';
      this.holdComments = this.selectedGridData[0].holdComments || '';
      this.reason = this.selectedGridData[0].reason || '';
      this.offHoldComments = this.selectedGridData[0].offHoldComments || '';
      this.isHold = false;
      this.holdBy = this.selectedGridData[0].holdBy || null;
      this.holdTime = this.selectedGridData[0].holdTime || null;
      this.offHoldBy = this.selectedGridData[0].offHoldBy || null;
      this.offHoldTime = this.selectedGridData[0].offHoldTime || null;
      this.selectedGridData.InventoryXHoldId
    }
  }

  fetchHoldCodes(): void {
    this.apiService.getHoldCodes(this.inventoryId).subscribe(
      (response: any) => {
        this.treeNodes = response;
        this.holdTypes = Array.from(new Set(this.treeNodes.map((node: any) => node.groupName)));
          if (this.mode === 'edit' && this.selectedHoldType && !this.holdTypes.includes(this.selectedHoldType)) {
          this.holdTypes.push(this.selectedHoldType);
        }
      },
      (error) => this.appService.errorMessage('Failed to load hold codes.')
    );
  }  

  onSelectionChange(event: any): void {
    const selectedNode = event.dataItem;
    if (selectedNode) {
      this.reason = selectedNode.holdCode;
      this.selectedIds.push(selectedNode.holdCodeId);
    }
  }

  save(): void {
    if (!this.holdComments || !this.selectedHoldType) {
      this.appService.errorMessage('Please fill in the required fields.');
      return;
    }
    const payload = {
      InventoryXHoldId: this.selectedGridData.InventoryXHoldId || null,
      InventoryId: this.inventoryId,
      Reason: this.reason,
      HoldComments: this.holdComments,
      HoldType: this.selectedHoldType,
      HoldCodeId: this.selectedIds[0] || null,
      OffHoldComments: this.isHold ? null : this.offHoldComments,
      UserId: 1
    };
    this.apiService.upsertInventoryHold(payload, { responseType: 'text' }).subscribe(
      () => this.appService.successMessage('Hold details have been saved successfully!'),
      () => this.appService.errorMessage('Failed to save hold details.')
    );
  }

  resetForm(): void {
    this.isHold = false;
    this.selectedHoldType = '';
    this.holdComments = '';
    this.reason = '';
    this.offHoldComments = '';
    this.cancel.emit();
  }
}