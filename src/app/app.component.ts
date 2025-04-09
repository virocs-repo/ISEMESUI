import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { AppService } from './services/app.service';
import { DrawerItem, DrawerSelectEvent } from '@progress/kendo-angular-layout';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { Address, Coo, DeviceFamily, ICON, LotOwners, Others, PackageCategory, ReceiptStatus, ServiceCategory, TrayPart, TrayVendor } from './services/app.interface';
import { Subscription } from 'rxjs';

interface DrawerItemExtra extends DrawerItem {
  routerLink?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'play-k16';

  public expanded = false;
  public items: Array<DrawerItemExtra> = [
    { text: 'Receiving', svgIcon: ICON.selectBoxIcon, routerLink: '/receiving', selected: true },
    { text: 'Inventory Checkin/Checkout', svgIcon: ICON.cartIcon, routerLink: '/inventory-checkinCheckout' },
    { text: 'Shipping', svgIcon: ICON.exportIcon, routerLink: '/shipping' },
    { text: 'Inventory', svgIcon: ICON.windowRestoreIcon, routerLink: '/inventory' },
    { text: 'Customer Order/Request', svgIcon: ICON.jsIcon, routerLink: '/customer-order' },
    { text: 'Reports', svgIcon: ICON.clipboardTextIcon, routerLink: '/reports' },
  ];
  readonly subscription = new Subscription()

  constructor(public authService: AuthService, public appService: AppService, private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    this.initMasterData();
    this.getAllEntityData();
    this.getAddresses();
    this.fetchHardwareTypes();
    this.getDeviceFamilies();
    this.getReceiverStatus();
    this.getServiceCategory();
    this.getCoo();
    this.getLotOwners();
    this.getTrayVendor();
    this.getTrayPart();
    this.getPackageCategoryList();
    this.getOthersList();

    this.subscription.add(this.appService.eventEmitter.subscribe((e) => {
      console.log(e);

      switch (e.action) {
        case 'refreshVendors':
          if (this.appService.refreshVendors) {
            this.appService.refreshVendors = false;
            this.getAllEntityData();
          }
          break;
        default:
          break;
      }
    }))
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public toggleDrawer(): void {
    this.expanded = !this.expanded;
  }

  onSelect(ev: DrawerSelectEvent): void {
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
        this.appService.masterData = Object.assign(this.appService.masterData, masterData);
        this.appService.eventEmitter.emit({ action: 'updates', data: { m: 'masterData' } })
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
    // if (this.appService.masterData.entityMap[entityType].length > 0) {
    //   return;
    // }
    this.apiService.getEntitiesName(entityType).subscribe({
      next: (value: any) => {
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

  private getDeviceFamilies() {
    this.apiService.DeviceFamilies(775).subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.deviceFamily = value.map((a: DeviceFamily) => {
            let props = [a.deviceFamilyId, a.deviceFamilyName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }

  private getReceiverStatus() {
    this.apiService.ReceiverStatus().subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.receiptStatus = value.map((a: ReceiptStatus) => {
            let props = [a.masterListItemId, a.itemText]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }

  private getServiceCategory() {
    this.apiService.ServiceCategory("GoodsType").subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.serviceCategory = value.map((a: ServiceCategory) => {
            let props = [a.serviceCategoryId, a.serviceCategoryName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }

  private getLotOwners() {
    this.apiService.LotOwners().subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.lotOwners = value.map((a: LotOwners) => {
            let props = [a.employeeID, a.employeeName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }

  private getCoo() {
    this.apiService.ServiceCategory("CountryOfOrigin").subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.coo = value.map((a: Coo) => {
            let props = [a.serviceCategoryId, a.serviceCategoryName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }

  private getTrayVendor() {
    this.apiService.TrayVendor(775).subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.trayVendor = value.map((a: TrayVendor) => {
            let props = [a.trayVendorId, a.vendorName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }

  private getTrayPart() {
    this.apiService.TrayPart(775,2).subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.trayPart = value.map((a: TrayPart) => {
            let props = [a.trayPartId, a.trayNumber]
            props = props.filter(a => a)
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
        this.appService.hardwareTypes = hardwareTypes;
      }
    })
  }
  private getPackageCategoryList() {
    this.apiService.getPackageCategoryList("PackageCategory").subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.PackageCategory = value.map((a: PackageCategory) => {
            let props = [a.id, a.categoryName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }
  private getOthersList() {
    this.apiService.getPackageCategoryList("Others").subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.Others = value.map((a:Others) => {
            let props = [a.Id, a.CategoryName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }
}
