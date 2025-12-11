import { Component } from '@angular/core';

@Component({
  selector: 'app-inventory-details',
  templateUrl: './inventory-details.component.html',
  styleUrls: ['./inventory-details.component.scss'],
  standalone: false
})
export class InventoryDetailsComponent {
  public gridData = [
    {
      Steps: 'step 1',
      Process: 'Incoming QA',
      Qty: 100,
      Unprocessed: '',
      Good: 95,
      Reject: 5
    },
    {
      Steps: 'step 2',
      Process: 'Storage',
      Qty: 95,
      Unprocessed: '',
      Good: 95,
      Reject: 0
    },
    {
      Steps: 'step 3',
      Process: 'Production',
      Qty: 95,
      Unprocessed: 5,
      Good: 90,
      Reject: 5
    },
    {
      Steps: 'step 4',
      Process: 'Outgoing QA',
      Qty: 90,
      Unprocessed: 5,
      Good: 90,
      Reject: 0
    },
    {
      Steps: 'step 5',
      Process: 'Shipping',
      Qty: 90,
      Unprocessed: 0,
      Good: 90,
      Reject: 0
    }
  ];
}
