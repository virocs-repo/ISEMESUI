import { Component,EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Input() holdTypes: string[] = [];
  @Input() inventoryId: number =0;
  @Output() cancel = new EventEmitter<void>();
  isHold: boolean = true;
  selectedHoldType: string = '';
  selectedHoldCode: string = '';
  holdComments: string = '';
  reason: string = '';
  offHoldComments: string = '';
  treeNodes: any[] = [];
  selectedIds: any[] = [];

  constructor(private appService: AppService,private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchHoldCodes();
  }

  fetchHoldCodes(): void {
    this.apiService.getHoldCodes(this.inventoryId).subscribe(
      (response: any) => {
        console.log('API Response:', response);
        this.treeNodes = response;
      },
      (error) => {
        console.error('Failed to fetch hold codes:', error);
        alert('Failed to load hold codes. Please try again.');
      }
    );
  }
  onSelectionChange(event: any): void {
    const selectedNode = event.dataItem;
    if (selectedNode) {
      const id = selectedNode.holdCodeId;
      this.reason = selectedNode.holdCode;
      this.selectedIds.push(id);
      console.log('Selected Node ID:', id);
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
      Reason: this.reason || '',
      HoldComments: this.holdComments,
      HoldType: this.selectedHoldType,
      HoldGroupId: 0, 
      HoldCodeId: this.selectedIds[0] || null,
      OffHoldComments: this.isHold ? null : this.offHoldComments,
      UserId: 1
    };
  
    this.apiService.upsertInventoryHold(payload, { responseType: 'text' }).subscribe(
      (response: any) => {
        console.log('API Response:', response);
        this.appService.successMessage('Hold details have been saved successfully!');
      },
      (error) => {
        console.error('API Error:', error);
        this.appService.errorMessage('Failed to save hold details. Please try again later.');
      }
    );
  }  

  resetForm(): void {
    this.isHold = false;
    this.selectedHoldType = '';
    this.selectedHoldCode = '';
    this.holdComments = '';
    this.reason = '';
    this.offHoldComments = '';
    this.cancel.emit();
  }
}