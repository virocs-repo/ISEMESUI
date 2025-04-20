import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AddDeviceComponent } from './components/add-device/add-device.component';
import { InventorycheckinCheckoutComponent } from './components/inventory-checkinCheckout/inventory-checkinCheckout.component';
import { ShippingComponent } from './components/shipping/shipping.component';
import { ReceivingComponent } from './components/receiving/receiving.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { CustomerOrderComponent } from './components/customer-order/customer-order.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ReceiptComponent } from './components/receipt/receipt.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { BrowserUtils } from '@azure/msal-browser';
import { InventoryHoldComponent } from './components/inventory-hold/inventory-hold.component';
import { AnotherShippingComponent } from './components/another-shipping/another-shipping.component';
import { CombinedLotComponent } from './components/combined-lot/combined-lot.component';
import { InventoryMoveComponent } from './components/inventory-move/inventory-move.component';
import { IntTranferReceivingComponent } from './components/int-tranfer-receiving/int-tranfer-receiving.component';
import { TicketComponent } from './components/ticket/ticket.component';
import { ReceiverFormInternalComponent } from './components/receiver-form-internal/receiver-form-internal.component';
import { ReceiverFormCustomerComponent } from './components/receiver-form-customer/receiver-form-customer.component';
import { MailRoomComponent } from './components/mail-room/mail-room.component';
import { SearchReceivingComponent } from './components/search-receiving/search-receiving.component';

const routes: Routes = [
  { path: 'search-receiving', component: SearchReceivingComponent, canActivate: [authGuard] },
  //{ path: 'receiving', component: ReceivingComponent, canActivate: [authGuard] },
  { path: 'receiver-form-internal', component: ReceiverFormInternalComponent, canActivate: [authGuard] },
  { path: 'receiver-form-customer', component: ReceiverFormCustomerComponent, canActivate: [authGuard] },
  { path: 'mail-room', component: MailRoomComponent, canActivate: [authGuard] },
  { path: 'inventory-hold', component: InventoryHoldComponent, canActivate: [authGuard] },
  { path: 'inventory-checkinCheckout', component: InventorycheckinCheckoutComponent, canActivate: [authGuard] },
  { path: 'shipping', component: ShippingComponent, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },
  { path: 'customer-order', component: CustomerOrderComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'another-shipping', component: AnotherShippingComponent, canActivate: [authGuard] },
  { path: 'combined-lot', component: CombinedLotComponent, canActivate: [authGuard] },
  { path: 'inventory-move', component: InventoryMoveComponent, canActivate: [authGuard] },
  { path: 'int-transfer-receiving', component: IntTranferReceivingComponent, canActivate: [authGuard] },
  { path: 'receipt', component: ReceiptComponent, canActivate: [authGuard] },
  { path: 'add-device', component: AddDeviceComponent, canActivate: [authGuard] },
  { path: 'ticket', component: TicketComponent, canActivate: [authGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', component: ReceiverFormInternalComponent, canActivate: [authGuard] },
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
