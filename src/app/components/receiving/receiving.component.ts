import { Component } from '@angular/core';
import { MenuItem } from '@progress/kendo-angular-menu';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-receiving',
  templateUrl: './receiving.component.html',
  styleUrls: ['./receiving.component.scss']
})
export class ReceivingComponent {
  isAddButtonEnabled: boolean = this.appService.feature.find(o => o.featureName == 'Receiving Add')?.active ?? false;
  isEditButtonEnabled: boolean = this.appService.feature.find(o => o.featureName == "Receiving Edit")?.active ?? false;
  // ""
  public gridData = [
    {
      RecordID: 'REQ-00001',
      ReceiveFrom: 'Vendor',
      Customer: 'Amazon',
      ReceivedOnBehalf: 'Qualcomm',
      ReceivingLocation: 'CA',
      DeliveryMethod: 'Courier',
      GoodsType: 'Hardware'
    }, {
      RecordID: 'REQ-00002',
      ReceiveFrom: 'Customer',
      Customer: 'Qualcomm',
      ReceivedOnBehalf: 'ASE',
      ReceivingLocation: 'CA',
      DeliveryMethod: 'Pick Up',
      GoodsType: 'Device'
    }, {
      RecordID: 'REQ-00003',
      ReceiveFrom: 'Customer',
      Customer: 'Cisco',
      ReceivedOnBehalf: 'Cisco',
      ReceivingLocation: 'CA',
      DeliveryMethod: 'Drop Off',
      GoodsType: 'Hardware'
    }, {
      RecordID: 'REQ-00004',
      ReceiveFrom: 'Vendor',
      Customer: 'Amazon',
      ReceivedOnBehalf: 'Qualcomm',
      ReceivingLocation: 'CA',
      DeliveryMethod: 'Courier',
      GoodsType: 'Hardware'
    }, {
      RecordID: 'REQ-00005',
      ReceiveFrom: 'Vendor',
      Customer: 'Amazon',
      ReceivedOnBehalf: 'Qualcomm',
      ReceivingLocation: 'CA',
      DeliveryMethod: 'Courier',
      GoodsType: 'Hardware'
    }, {
      RecordID: 'REQ-00005',
      ReceiveFrom: 'Vendor',
      Customer: 'Amazon',
      ReceivedOnBehalf: 'Qualcomm',
      ReceivingLocation: 'CA',
      DeliveryMethod: 'Courier',
      GoodsType: 'Hardware'
    }
  ];
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
  public items: MenuItem[] = [
    { text: 'Void Data', icon: 'close' },
    { text: 'Edit Data', icon: 'edit', disabled: !this.isEditButtonEnabled },
    { text: 'View Data', icon: 'eye' },
    { text: 'Export Data', icon: 'export' }
  ];


  isDialogOpen = false;
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog() {
    this.isDialogOpen = false;
  }

  constructor(private appService: AppService) { }

  ngOnInit(): void {
  }

}
