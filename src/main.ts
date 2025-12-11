/// <reference types="@angular/localize" />

// Set Kendo license BEFORE any other imports
import { setScriptKey } from '@progress/kendo-licensing';
import { environment } from './environments/environment';

// Apply Kendo UI License - MUST be set before any Kendo components are imported
if (environment.kendoLicenseKey) {
  setScriptKey(environment.kendoLicenseKey);
  console.log('Kendo license key set successfully');
} else {
  console.warn('Kendo license key not found in environment');
}

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
