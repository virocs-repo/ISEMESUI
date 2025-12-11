import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-traveller-landing',
  templateUrl: './traveller-landing.component.html',
  styleUrls: ['./traveller-landing.component.scss'],
  standalone: false
})
export class TravellerLandingComponent {
  isScanBadgeDialogOpen: boolean = false;
  selectedAction: 'checkin' | 'checkout' | null = null;

  constructor(private router: Router) { }

  navigateToCheckIn(): void {
    this.selectedAction = 'checkin';
    this.isScanBadgeDialogOpen = true;
  }

  navigateToCheckOut(): void {
    this.selectedAction = 'checkout';
    this.isScanBadgeDialogOpen = true;
  }

  onBadgeAuthorized(badgeValue: string): void {
    // Close the dialog
    this.isScanBadgeDialogOpen = false;
    
    // Navigate to check-in/checkout page with the action and badge value
    this.router.navigate(['/inventory/inventory-checkinCheckout'], { 
      queryParams: { 
        action: this.selectedAction,
        badge: badgeValue
      } 
    });
    
    this.selectedAction = null;
  }

  onBadgeCancelled(): void {
    this.isScanBadgeDialogOpen = false;
    this.selectedAction = null;
  }
}

