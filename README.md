# PlayK16

Playground for Kendo and Angular 16

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## To run

```bash
# Setup only once
npm ci
# place kendo-ui-license.txt in root level
npx kendo-ui-license activate

# Run the app
ng serve -o --port=3000
```

## Commands

```bash
ng g c components/home --skip-tests
ng g c components/login --skip-tests
ng g c components/header --skip-tests

ng g c components/receiving --skip-tests
ng g c components/receipt --skip-tests
ng g c components/add-device --skip-tests
ng g c components/inventory-move --skip-tests
ng g c components/add-check-inout --skip-tests
ng g c components/shipping --skip-tests
ng g c components/add-shipping --skip-tests
ng g c components/shipping-record --skip-tests
ng g c components/inventory --skip-tests
ng g c components/inventory-details --skip-tests
ng g c components/onoff-hold --skip-tests
ng g c components/hold-details --skip-tests

ng g c components/customer-order --skip-tests
ng g c components/add-customer-request --skip-tests
ng g c components/reports --skip-tests

ng g service services/token-manager --skip-tests
ng g service services/auth --skip-tests
ng g service services/api --skip-tests

ng g guard guards/auth --skip-tests

ng add @progress/kendo-angular-navigation@16
ng add @progress/kendo-angular-layout@16
ng add @progress/kendo-angular-inputs@16
ng add @progress/kendo-angular-buttons@16
ng add @progress/kendo-angular-icons@16

ng add @progress/kendo-angular-grid@16
ng add @progress/kendo-angular-menu@16
ng add @progress/kendo-angular-dateinputs@16
ng add @progress/kendo-angular-dialog@16
ng add @progress/kendo-angular-upload@16

cd github/ise-labs-ase
ng serve -o --port=3000
```

## MSAL

```bash
npm install @azure/msal-browser@3 @azure/msal-angular@3

```
- `MSAL` Guide https://learn.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-angular-auth-code
- `Sign in with Microsoft` Button Policy https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps
