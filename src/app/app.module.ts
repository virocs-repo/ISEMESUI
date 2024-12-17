import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Kendo
import { NavigationModule } from '@progress/kendo-angular-navigation';
import { DrawerModule, LayoutModule } from '@progress/kendo-angular-layout';
import { CheckBoxModule, InputsModule } from '@progress/kendo-angular-inputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { IconsModule, SVGIconModule } from '@progress/kendo-angular-icons';
import { ContextMenuModule, MenuModule } from '@progress/kendo-angular-menu';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ExcelModule, GridModule, PDFService } from '@progress/kendo-angular-grid';
import { LabelModule } from '@progress/kendo-angular-label';
import { AutoCompleteModule, ComboBoxModule, MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { UploadsModule } from '@progress/kendo-angular-upload';

// MSAL
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalGuardConfiguration, MsalInterceptor, MsalInterceptorConfiguration, MsalModule, MsalRedirectComponent, MsalService } from "@azure/msal-angular";
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';

// Other
import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { HeaderComponent } from './components/header/header.component';
import { ReceivingComponent } from './components/receiving/receiving.component';
import { ReceiptComponent } from './components/receipt/receipt.component';
import { AddDeviceComponent } from './components/add-device/add-device.component';
import { InventorycheckinCheckoutComponent } from './components/inventory-checkinCheckout/inventory-checkinCheckout.component';
import { ShippingComponent } from './components/shipping/shipping.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { CustomerOrderComponent } from './components/customer-order/customer-order.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AddCheckInoutComponent } from './components/add-check-inout/add-check-inout.component';
import { AddShippingComponent } from './components/add-shipping/add-shipping.component';
import { ShippingRecordComponent } from './components/shipping-record/shipping-record.component';
import { InventoryDetailsComponent } from './components/inventory-details/inventory-details.component';
import { AddCustomerRequestComponent } from './components/add-customer-request/add-customer-request.component';
import { OnoffHoldComponent } from './components/onoff-hold/onoff-hold.component';
import { HoldDetailsComponent } from './components/hold-details/hold-details.component';
import { ApiInterceptor } from './services/api.interceptor';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { InventoryHoldComponent } from './components/inventory-hold/inventory-hold.component';
import { ExcelExportModule } from '@progress/kendo-angular-excel-export';
import { AddHoldComponent } from './components/add-hold/add-hold.component';
import { AnotherShippingComponent } from './components/another-shipping/another-shipping.component';
import { CombinedLotComponent } from './components/combined-lot/combined-lot.component';
import { AddAnotherShippingComponent } from './components/add-another-shipping/add-another-shipping.component';
import { AddCombinedLotComponent } from './components/add-combined-lot/add-combined-lot.component';
import { EditInventoryHoldComponent } from './components/edit-inventory-hold/edit-inventory-hold.component';
import { TreeViewModule } from '@progress/kendo-angular-treeview';



const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;
const MSAL_VARS = [environment.msalConfig.auth.clientId, environment.msalConfig.auth.authority, environment.msalConfig.auth.redirectUri];

if (MSAL_VARS.some(v => !v)) {
  console.log('Make sure to set the clientId, authority, and redirectUri in src/environments/environment.ts');
  console.log(environment.msalConfig);
}
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.auth.clientId, // Application (client) ID from the app registration
      authority: environment.msalConfig.auth.authority, // The Azure cloud instance and the app's sign-in audience (tenant ID, common, organizations, or consumers)
      redirectUri: environment.msalConfig.auth.redirectUri // This is your redirect URI
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    }
  })
}
let guardConfig: any;
let interceptorConfig: any;

//2
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...environment.apiConfig.scopes]
    },
    loginFailedRoute: '/login-failed'
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(environment.apiConfig.uri, environment.apiConfig.scopes);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}
export function initializeMsal(msalService: MsalService): () => Promise<void> {
  return () => msalService.instance.initialize();
}
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    HeaderComponent,
    ReceivingComponent,
    ReceiptComponent,
    AddDeviceComponent,
    InventorycheckinCheckoutComponent,
    ShippingComponent,
    InventoryComponent,
    CustomerOrderComponent,
    ReportsComponent,
    AddCheckInoutComponent,
    AddShippingComponent,
    ShippingRecordComponent,
    InventoryDetailsComponent,
    AddCustomerRequestComponent,
    OnoffHoldComponent,
    HoldDetailsComponent,
    InventoryHoldComponent,
    AddHoldComponent,
    AnotherShippingComponent,
    CombinedLotComponent,
    AddAnotherShippingComponent,
    AddCombinedLotComponent,
    EditInventoryHoldComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    // MSAL
    MsalModule,
    // Kendo
    NavigationModule,
    LayoutModule,
    InputsModule,
    ButtonsModule,
    IconsModule,
    MenuModule,
    DateInputsModule,
    GridModule,
    LabelModule,
    ComboBoxModule,
    DialogsModule,
    ContextMenuModule,
    CheckBoxModule,
    AutoCompleteModule,
    UploadsModule,
    HttpClientModule,
    SVGIconModule,
    DrawerModule,
    NotificationModule,
    MultiSelectModule,
    PDFExportModule,
    ExcelExportModule,
    ExcelModule,
    TreeViewModule,

  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMsal,
      deps: [MsalService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    PDFService,
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true }
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
