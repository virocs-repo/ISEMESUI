import { Component, EventEmitter, Output, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-scan-badge',
  templateUrl: './scan-badge.component.html',
  styleUrls: ['./scan-badge.component.scss'],
  standalone: false
})
export class ScanBadgeComponent implements OnInit {
  @Output() authorized = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();
  @ViewChild('badgeInput', { static: true }) badgeInput!: ElementRef<HTMLInputElement>;
  
  readonly ICON = ICON;
  badgeScanValue: string = '';
  isAuthorizing: boolean = false;

  ngOnInit(): void {
    // Focus on input when dialog opens
    setTimeout(() => {
      if (this.badgeInput) {
        this.badgeInput.nativeElement.focus();
      }
    }, 100);
  }

  onBadgeInput(event: any): void {
    this.badgeScanValue = event.target.value || '';
    // Auto-submit if Enter is pressed or if scanner sends data
    if (event.key === 'Enter' && this.badgeScanValue.trim()) {
      this.authorize();
    }
  }

  onBadgeScan(event: any): void {
    // Handle scanner input (usually comes as paste or direct input)
    this.badgeScanValue = event.target.value || '';
    if (this.badgeScanValue.trim()) {
      // Small delay to allow scanner to complete input
      setTimeout(() => {
        this.authorize();
      }, 100);
    }
  }

  authorize(): void {
    if (!this.badgeScanValue.trim()) {
      return;
    }
    
    this.isAuthorizing = true;
    // Emit the scanned badge value
    this.authorized.emit(this.badgeScanValue.trim());
    this.isAuthorizing = false;
  }

  cancel(): void {
    this.badgeScanValue = '';
    this.cancelled.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancel();
    }
  }
}

