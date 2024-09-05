import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { AppService } from './services/app.service';
import { DrawerItem, DrawerSelectEvent } from '@progress/kendo-angular-layout';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';

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
    { text: 'Receiving', icon: 'k-i-home', routerLink: '/receiving', selected: true },
    { text: 'Inventory Move', icon: 'k-i-info', routerLink: '/inventory-move' },
    { text: 'Shipping', icon: 'k-i-email', routerLink: '/shipping' },
    { text: 'Inventory', icon: 'k-i-email', routerLink: '/inventory' },
    { text: 'Customer Order/Request', icon: 'k-i-email', routerLink: '/customer-order' },
    { text: 'Reports', icon: 'k-i-email', routerLink: '/reports' },
  ];


  constructor(public authService: AuthService, public appService: AppService, private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    this.initMasterData();
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
        console.log(v)
        this.appService.masterData = v.root[0]
        console.log(this.appService.masterData);

      },
      error: (v) => {
        console.error(v)
      }
    })
  }
}
