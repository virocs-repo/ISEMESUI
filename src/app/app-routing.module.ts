import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AddDeviceComponent } from './components/add-device/add-device.component';
import { InventoryMoveComponent } from './components/inventory-move/inventory-move.component';
import { ShippingComponent } from './components/shipping/shipping.component';
import { ReceivingComponent } from './components/receiving/receiving.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { CustomerOrderComponent } from './components/customer-order/customer-order.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ReceiptComponent } from './components/receipt/receipt.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { BrowserUtils } from '@azure/msal-browser';

const routes: Routes = [
  { path: 'receiving', component: ReceivingComponent, canActivate: [authGuard] },
  { path: 'inventory-move', component: InventoryMoveComponent, canActivate: [authGuard] },
  { path: 'shipping', component: ShippingComponent, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },
  { path: 'customer-order', component: CustomerOrderComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'receipt', component: ReceiptComponent, canActivate: [authGuard] },
  { path: 'add-device', component: AddDeviceComponent, canActivate: [authGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', component: ReceivingComponent, canActivate: [authGuard] },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      // Don't perform initial navigation in iframes or popups
      initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
        ? "enabledNonBlocking"
        : "disabled", // Set to enabledBlocking to use Angular Universal
    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
