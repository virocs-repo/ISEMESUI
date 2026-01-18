import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';
import { FormsModule } from '@angular/forms';
import { BarcodeScannerService } from './barcode-scanner.service';
import { DialogModule } from "@progress/kendo-angular-dialog";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { ButtonsModule } from '@progress/kendo-angular-buttons';


@Component({
  selector: 'app-publicform',
  templateUrl: './publicform.component.html',
  styleUrls: ['./publicform.component.css'],
  imports: [DialogModule, InputsModule, ButtonsModule,FormsModule]
})
export class PublicFormComponent {
 constructor(public appService: AppService,
              private apiService: ApiService,
              private router: Router,
              private scanner: BarcodeScannerService) { 
    
 }
  showScanner = false;
  barcodeValue = '';
  isAuthorized = false;
  checkInSearchText = '';
  checkOutSearchText = '';
  type: string = '';
  scanningLocked = false;

  go(type: string) {
    this.showScanner = true;
    this.type = type;
  }
  ngOnInit() {
    this.scanner.scan$.subscribe(code => {
      this.barcodeValue = code;
      console.log("Scanned:", code);
    });
  }
  
   authorizeScan() {
        if (this.barcodeValue.trim() !== '') {
            this.apiService.validateBarcode(this.barcodeValue.trim()).subscribe((response: any) => {
            
            if ((response.employeeId && response.employeeId > 0) ||
              (response.customerLoginId && response.customerLoginId > 0)) {
                this.isAuthorized = true; 
                this.isAuthorized = true;
                this.showScanner = false;
                localStorage.setItem('employeeId', response.employeeId ? response.employeeId.toString() : '0');
                localStorage.setItem('customerLoginId', response.customerLoginId ? response.customerLoginId.toString() : '0');
                localStorage.setItem('scanBadge', this.barcodeValue.trim());
                localStorage.setItem('userName', response.userName ? response.userName : '');
                switch(this.type) {
                    case 'checkin':
                    case 'checkout':
                        localStorage.setItem('checkOutSearchText', this.barcodeValue.trim());
                        this.router.navigate(['/checkin-checkout', this.type]);
                        break;
                }
                
               
                      
            }else {
                alert('Unauthorized scan. Please try again.');
                this.isAuthorized = false;
                this.barcodeValue = '';
            }
        });
    }
  }
  
  
  openScanner() {
    this.showScanner = true;
  }

  closeScanner() {
    this.showScanner = false;
    this.barcodeValue = '';
  }
}
