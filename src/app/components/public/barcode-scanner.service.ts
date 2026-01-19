import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BarcodeScannerService {

  private buffer = '';
  private lastKeyTime = 0;

  private scanSubject = new Subject<string>();
  scan$ = this.scanSubject.asObservable();

  constructor() {
    this.listenToKeyboard();
  }

  private listenToKeyboard() {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      const now = Date.now();

      // Reset if time between keys is too long (>50ms)
      if (now - this.lastKeyTime > 50) {
        this.buffer = '';
      }

      // Append only printable characters
      if (event.key.length === 1) {
        this.buffer += event.key;
      }

      this.lastKeyTime = now;

      // Barcode scanners usually send ENTER at the end
      if (event.key === 'Enter') {
        this.scanSubject.next(this.buffer);
        this.buffer = '';
      }
    });
  }
}
