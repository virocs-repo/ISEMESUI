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
  public selectedTabIndex: number = 0; // 0 = Device Family, 1 = Device

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Listen to route changes to update selected tab
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
    if (url.includes('/devicemaster/device')) {
      this.selectedTabIndex = 1;
    } else {
      this.selectedTabIndex = 0; // Default to Device Family
    }
  }

  onTabSelect(event: any): void {
    // Handle both event object and direct index
    const index = (event && typeof event === 'object' && 'index' in event) ? event.index : event;
    this.selectedTabIndex = typeof index === 'number' ? index : 0;
    
    if (this.selectedTabIndex === 0) {
      this.router.navigate(['/devicemaster/device-family']);
    } else if (this.selectedTabIndex === 1) {
      this.router.navigate(['/devicemaster/device']);
    }
  }
}

