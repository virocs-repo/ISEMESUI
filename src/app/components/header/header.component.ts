import { Component } from '@angular/core';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { menuIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';

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
  constructor(public authService: AuthService, public appService: AppService) { }

  onSelectRowActionMenu(e: ContextMenuSelectEvent) {
    console.log(e);
    switch (e.item.text) {
      case 'Logout':
        this.authService.logout();
        break;
    }
  }
}
