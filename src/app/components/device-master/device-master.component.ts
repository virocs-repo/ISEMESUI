import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-device-master',
  templateUrl: './device-master.component.html',
  styleUrls: ['./device-master.component.scss'],
  standalone: false
})
export class DeviceMasterComponent implements OnInit {
  public selectedTabIndex: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateSelectedTab();
    });
  }

  ngOnInit(): void {
    this.updateSelectedTab();
  }

  private updateSelectedTab(): void {
    const url = this.router.url;
    this.selectedTabIndex = url.includes('/devicemaster/device') ? 1 : 0;
  }

  onTabSelect(event: any): void {
    const index = (event && typeof event === 'object' && 'index' in event) ? event.index : event;
    this.selectedTabIndex = typeof index === 'number' ? index : 0;
    
    const routes = ['/devicemaster/device-family', '/devicemaster/device'];
    if (this.selectedTabIndex >= 0 && this.selectedTabIndex < routes.length) {
      this.router.navigate([routes[this.selectedTabIndex]]);
    }
  }
}

