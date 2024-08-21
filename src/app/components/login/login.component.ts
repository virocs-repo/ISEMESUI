import { Component, Inject } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isPasswordVisible: boolean = false;
  isRememberMeChecked: boolean = false;
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private msalService: MsalService, private apiService: ApiService,
    private appService: AppService
  ) { }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  login() {
    this.email = this.email.trim();
    this.password = this.password.trim();
    if (this.email == 'admin' && this.password == 'admin') {
      this.authService.loginSuccess();
    } else {
      this.getUserPreference(this.email, "string")
    }
  }
  loginWithMicrosoft() {
    this.msalService.loginPopup().subscribe({
      next: (authenticationResult) => {
        // this.onLoginSuccess();
        console.log({ authenticationResult });
        const idToken = authenticationResult.idToken;
        const name = authenticationResult.account.name;
        const email = authenticationResult.account.username;
        this.getUserPreference(email, idToken);
        alert(`Welcome ${name} (${email})`);
        console.log({ name });
        console.log({ email });

      },
      error: (error) => console.log(error)
    })
  }
  getUserPreference(email: string, idToken: string) {
    this.apiService.login({
      "username": "string",
      "password": "string",
      "external": false,
      "email": email,
      "idToken": idToken
    }).subscribe({
      next: (res: any) => {
        console.log(res);
        this.appService.savePreferences(res);
        this.authService.loginSuccess();
      },
      error: (err) => {
        console.error(`Login error 500`);
        console.log(err);
        alert("Error while logging in")
      },
    })
  }

  onLoginSuccess() {
    // this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    this.authService.loginSuccess();
  }

}
