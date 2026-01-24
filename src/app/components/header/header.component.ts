import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { menuIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { MsalService } from '@azure/msal-angular';
import { Client, ResponseType } from '@microsoft/microsoft-graph-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  readonly ICON = ICON
  public menuIcon: SVGIcon = menuIcon;
  profilePicture = "";
  selectedTabIndex = 0; // 0 = Inventory, 1 = Ticketing System, 2 = Device Master, 3 = Hardware

  isDialogOpen = false;

  profileActionMenu: MenuItem[] = [
    { text: 'Profile', svgIcon: ICON.userIcon },
    { text: 'Settings', svgIcon: ICON.gearIcon },
    { text: 'Logout', svgIcon: ICON.logoutIcon },
  ];
  constructor(
    private msalService: MsalService, 
    public authService: AuthService, 
    public appService: AppService,
    private router: Router,
    private titleService: Title
  ) {
    // Set initial tab based on current route
    const path = this.router.url;
    if (path.startsWith('/ticketing')) {
      this.selectedTabIndex = 1;
      this.titleService.setTitle('ISEMES Ticketing');
    } else if (path.startsWith('/devicemaster')) {
      this.selectedTabIndex = 2;
      this.titleService.setTitle('ISEMES Device Master');
    } else if (path.startsWith('/hardware')) {
      this.selectedTabIndex = 3;
      this.titleService.setTitle('ISEMES Hardware');
    } else {
      this.selectedTabIndex = 0;
      this.titleService.setTitle('ISEMES Inventory');
    }
    // Store in app service for app component to access
    this.appService.selectedTabIndex = this.selectedTabIndex;
    
    // Listen to route changes to update selected tab
    this.router.events.subscribe(() => {
      const currentPath = this.router.url;
      if (currentPath.startsWith('/ticketing')) {
        this.selectedTabIndex = 1;
        this.titleService.setTitle('ISEMES Ticketing');
      } else if (currentPath.startsWith('/devicemaster')) {
        this.selectedTabIndex = 2;
        this.titleService.setTitle('ISEMES Device Master');
      } else if (currentPath.startsWith('/hardware')) {
        this.selectedTabIndex = 3;
        this.titleService.setTitle('ISEMES Hardware');
      } else if (currentPath.startsWith('/inventory') || currentPath === '/' || currentPath === '') {
        this.selectedTabIndex = 0;
        this.titleService.setTitle('ISEMES Inventory');
      }
      // Sync with app service
      this.appService.selectedTabIndex = this.selectedTabIndex;
    });
  }

  onMainMenuSelect(index: number) {
    this.selectedTabIndex = index;
    // Update app service for app component to access
    this.appService.selectedTabIndex = index;
    // Update page title based on selected tab
    if (index === 1) {
      this.titleService.setTitle('ISEMES Ticketing');
    } else if (index === 2) {
      this.titleService.setTitle('ISEMES Device Master');
    } else if (index === 3) {
      this.titleService.setTitle('ISEMES Hardware');
    } else {
      this.titleService.setTitle('ISEMES Inventory');
    }
    // Navigate to default route for selected tab
    if (index === 0) {
      this.router.navigate(['/inventory/receiver-form-internal']);
    } else if (index === 1) {
      this.router.navigate(['/ticketing/ticket']);
    } else if (index === 2) {
      this.router.navigate(['/devicemaster/device-family']);
    } else if (index === 3) {
      this.router.navigate(['/hardware/probe-card']);
    }
  }

  onSelectRowActionMenu(e: ContextMenuSelectEvent) {
    switch (e.item.text) {
      case 'Logout':
        this.authService.logout();
        // clear data on logout
        this.profilePicture = '';
        break;
    }
  }

  ngOnInit(): void {
    this.getProfilePicture();
  }

  async getProfilePicture() {
    const accounts = await this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      const accessToken = await this.msalService.instance.acquireTokenSilent({
        scopes: ['user.read'],
        account: accounts[0]
      }).then(result => result.accessToken);

      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        }
      });

      const photo = await graphClient.api('/me/photo/$value').responseType(ResponseType.BLOB).get();
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicture = (e.target?.result as string) || '';
      };
      reader.readAsDataURL(photo);
    }
  }
}
