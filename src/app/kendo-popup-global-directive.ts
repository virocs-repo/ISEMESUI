import { Directive, AfterViewInit, Optional, Self } from '@angular/core';
import {
  ComboBoxComponent,
  DropDownListComponent,
  MultiSelectComponent
} from '@progress/kendo-angular-dropdowns';

@Directive({
  selector: `
    kendo-combobox,
    kendo-dropdownlist,
    kendo-multiselect
  `
})
export class KendoPopupGlobalFixDirective implements AfterViewInit {

  constructor(
    @Optional() @Self() private combo: ComboBoxComponent,
    @Optional() @Self() private dropdown: DropDownListComponent,
    @Optional() @Self() private multi: MultiSelectComponent
  ) {}

  ngAfterViewInit(): void {
    const host =
      this.combo || this.dropdown || this.multi;

    if (!host) return;

    (host as any).popupSettings = {
      ...(host as any).popupSettings,
      appendTo: 'component'
    };
  }
}
