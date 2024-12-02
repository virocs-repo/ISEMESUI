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

  holdTypes: string[] = [];
  isHold: boolean = true;
  selectedHoldType: string = '';
  holdComments: string = '';
  reason: string = '';
  offHoldComments: string = '';
  treeNodes: any[] = [];
  selectedIds: any[] = [];

  constructor(private appService: AppService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchHoldCodes();
    if (this.mode === 'edit') {
      this.isHold = true;
    } else {
      this.resetForm();
    }
  }

  fetchHoldCodes(): void {
    this.apiService.getHoldCodes(this.inventoryId).subscribe(
      (response: any) => {
        this.treeNodes = response;
        this.holdTypes = Array.from(new Set(this.treeNodes.map((node: any) => node.groupName)));
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
      InventoryXHoldId: null,
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