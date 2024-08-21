import { Component } from '@angular/core';
import { ColumnMenuSettings, SelectableSettings } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.scss']
})
export class AddDeviceComponent {
  public selectedValues: string = "";
  public listItems: Array<string> = [
    "Baseball",
    "Basketball",
    "Cricket",
    "Field Hockey",
    "Football",
    "Table Tennis",
    "Tennis",
    "Volleyball",
  ];
  gridData2 = [
    {
      Steps: 'REQ-00001',
      Process: '21561651313',
      ExpectedQty: 100,
      Expedite: false,
      PartNum: 1515,
      LabelCount: 151651,
      COO: 'CA',
      DateCode: 21321,
      Hold: true,
      HoldComments: 'Count Miss'
    },
    {
      Steps: 'REQ-00002',
      Process: '21561651313',
      ExpectedQty: 100,
      Expedite: true,
      PartNum: 1515,
      LabelCount: 151651,
      COO: 'CA',
      DateCode: 21321,
      Hold: false,
      HoldComments: 'Count Miss'
    },
    {
      Steps: 'REQ-00003',
      Process: '21561651313',
      ExpectedQty: 100,
      Expedite: false,
      PartNum: 1515,
      LabelCount: 151651,
      COO: 'CA',
      DateCode: 21321,
      Hold: true,
      HoldComments: 'Count Miss'
    },
    {
      Steps: 'REQ-00004',
      Process: '21561651313',
      ExpectedQty: 100,
      Expedite: true,
      PartNum: 1515,
      LabelCount: 151651,
      COO: 'CA',
      DateCode: 21321,
      Hold: false,
      HoldComments: 'Count Miss'
    }
  ];


  selectableSettings: SelectableSettings = {
    checkboxOnly: true,
    mode: 'single',
  }
  columnMenuSettings: ColumnMenuSettings = {
    lock: false,
    stick: false,
    setColumnPosition: { expanded: true },
    autoSizeColumn: true,
    autoSizeAllColumns: true,
  }
  public items: any[] = [
    { text: 'Item1', icon: 'edit' },
    { text: 'Item2', icon: 'delete' },
    { text: 'Item3', icon: 'copy' }
  ];
}
