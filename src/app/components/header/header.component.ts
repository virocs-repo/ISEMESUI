import { Component } from '@angular/core';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { menuIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { MsalService } from '@azure/msal-angular';
import { Client, ResponseType } from '@microsoft/microsoft-graph-client';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly ICON = ICON
  public menuIcon: SVGIcon = menuIcon;
  img1 = "https://demos.telerik.com/kendo-ui/content/web/Customers/RICSU.jpg";

  isDialogOpen = false;

  profileActionMenu: MenuItem[] = [
    { text: 'Profile', svgIcon: ICON.userIcon },
    { text: 'Settings', svgIcon: ICON.gearIcon },
    { text: 'Logout', svgIcon: ICON.logoutIcon },
  ];
  constructor(private msalService: MsalService, public authService: AuthService, public appService: AppService) { }

  onSelectRowActionMenu(e: ContextMenuSelectEvent) {
    console.log(e);
    switch (e.item.text) {
      case 'Logout':
        this.authService.logout();
        break;
    }
  }

  ngOnInit(): void {
   this.getProfilePicture();
  }

  async getProfilePicture() {
    const accounts = await this.msalService.instance.getAllAccounts();
    if(accounts.length > 0) {
      const  accessToken = await this.msalService.instance.acquireTokenSilent({ 
        scopes: ['user.read'],
        account: accounts[0]
        }).then(result => result.accessToken);
      
      const graphClient = Client.init({authProvider: (done) => {
        done(null, accessToken);
      }});

      const photo = await graphClient.api('/me/photo/$value').responseType(ResponseType.BLOB).get(); 
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img1 = e.target?.result as string;
      };
      reader.readAsDataURL(photo);
    }
  }
}
