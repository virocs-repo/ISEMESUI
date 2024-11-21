import { Component } from '@angular/core';

@Component({
  selector: 'app-add-hold',
  templateUrl: './add-hold.component.html',
  styleUrls: ['./add-hold.component.scss']
})

export class AddHoldComponent {
  // Variables for Lot Info
  lotNumber: string = 'L11240068';
  customer: string = 'Marvell Semiconductor Inc.';
  device: string = 'Device12';

  // Variables for Hold Details
  isHold: boolean = false;
  holdTypes: string[] = ['Receiving', 'Engineering', 'QA'];
  selectedHoldType: string = '';

  holdCodes = [
    { value: 'customerService', label: 'Customer Service' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'qa', label: 'QA' }
  ];
  selectedHoldCode: string = '';

  holdComments: string = '';
  reason: string = '';
  offHoldComments: string = '';

  // Variables for Hold Time and By
  holdBy: string = '...';
  holdTime: string = '...';
  offHoldBy: string = '...';
  offHoldTime: string = '...';

  /**
   * Save method: Simulates form submission
   */
  save(): void {
    if (!this.holdComments || !this.selectedHoldType) {
      alert('Please fill in the required fields (Hold Comments and Hold Type).');
      return;
    }

    const formData = {
      lotNumber: this.lotNumber,
      customer: this.customer,
      device: this.device,
      isHold: this.isHold,
      selectedHoldType: this.selectedHoldType,
      selectedHoldCode: this.selectedHoldCode,
      holdComments: this.holdComments,
      reason: this.reason,
      offHoldComments: this.offHoldComments,
      holdBy: this.holdBy,
      holdTime: this.holdTime,
      offHoldBy: this.offHoldBy,
      offHoldTime: this.offHoldTime
    };

    console.log('Form Submitted:', formData);
    alert('Hold details have been saved successfully!');
  }

  /**
   * Cancel method: Resets the form or redirects the user
   */
  cancel(): void {
    const confirmation = confirm('Are you sure you want to cancel? Unsaved changes will be lost.');
    if (confirmation) {
      this.resetForm();
    }
  }

  /**
   * Reset form to initial values
   */
  resetForm(): void {
    this.isHold = false;
    this.selectedHoldType = '';
    this.selectedHoldCode = '';
    this.holdComments = '';
    this.reason = '';
    this.offHoldComments = '';
    this.holdBy = '...';
    this.holdTime = '...';
    this.offHoldBy = '...';
    this.offHoldTime = '...';

    console.log('Form has been reset.');
  }
}
