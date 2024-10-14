import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { AppService } from './services/app.service';
import { DrawerItem, DrawerSelectEvent } from '@progress/kendo-angular-layout';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { Address, ICON } from './services/app.interface';

interface DrawerItemExtra extends DrawerItem {
  routerLink?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'play-k16';

  public expanded = false;
  public items: Array<DrawerItemExtra> = [
    { text: 'Receiving', svgIcon: ICON.selectBoxIcon, routerLink: '/receiving', selected: true },
    { text: 'Inventory Move', svgIcon: ICON.cartIcon, routerLink: '/inventory-move' },
    { text: 'Shipping', svgIcon: ICON.exportIcon, routerLink: '/shipping' },
    { text: 'Inventory', svgIcon: ICON.windowRestoreIcon, routerLink: '/inventory' },
    { text: 'Customer Order/Request', svgIcon: ICON.jsIcon, routerLink: '/customer-order' },
    { text: 'Reports', svgIcon: ICON.clipboardTextIcon, routerLink: '/reports' },
  ];


  constructor(public authService: AuthService, public appService: AppService, private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    this.initMasterData();
    this.getAllEntityData();
    this.getAddresses();
    this.fetchHardwareTypes();
  }

  public toggleDrawer(): void {
    this.expanded = !this.expanded;
  }

  onSelect(ev: DrawerSelectEvent): void {
    console.log(ev);
    if (ev.item.routerLink) {
      this.router.navigate([ev.item.routerLink]);
    }
    console.log(ev.item.text + ' selected');
    // Handle menu item selection here
  }
  private initMasterData() {
    this.apiService.getMasterData().subscribe({
      next: (v: any) => {
        const masterData = v.root[0];
        if (masterData) {
          delete masterData.customer;
        }
        this.appService.masterData = Object.assign(this.appService.masterData, masterData)
        console.log(this.appService.masterData);
      },
      error: (v) => {
        console.error(v)
      }
    })
  }
  private getAllEntityData() {
    this.getEntity('Customer');
    this.getEntity('Vendor');
    this.getEntity('Employee');
  }
  private getEntity(entityType: 'Customer' | 'Vendor' | 'Employee') {
    if (this.appService.masterData.entityMap[entityType].length > 0) {
      return;
    }
    this.apiService.getEntitiesName(entityType).subscribe({
      next: (value: any) => {
        console.log(value);
        this.appService.masterData.entityMap[entityType] = value;
      },
      error(err) { }
    })
  }

  private getAddresses() {
    this.apiService.getAddresses().subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.addresses = value.map((a: Address) => {
            let props = [a.address1, a.address2, a.city, a.state, a.country]
            props = props.filter(a => a)
            a.fullAddress = props.join(', ')
            return a;
          })
        }
      }
    });
  }

  private fetchHardwareTypes() {
    // getHardwareTypes
    this.apiService.getHardwareTypes().subscribe({
      next: (hardwareTypes: any) => {
        console.log({ hardwareTypes });
        this.appService.hardwareTypes = hardwareTypes;
      }
    })
  }
}
