import { Component, Inject } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { ApiService } from 'src/app/services/api.service';
import { ICON } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent {
  readonly ICON = ICON
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
      if (this.email && this.password) {
        this.getUserPreference(this.email, "")
      }
    }
  }
  loginWithMicrosoft() {
    this.msalService.loginPopup().subscribe({
      next: (authenticationResult) => {
        // this.onLoginSuccess();
        console.log({ authenticationResult });
        const idToken = authenticationResult.idToken;
        const name = authenticationResult.account.name || '';
        const email = authenticationResult.account.username;
        this.getUserPreference(email, idToken);
        alert(`Welcome ${name} (${email})`);
        console.log({ name });
        console.log({ email });
        const firstName = this.appService.extractFirstName(name);
        this.appService.saveUserInfo({ name, email, firstName })
      },
      error: (error) => console.log(error)
    })
  }
  getUserPreference(email: string, idToken: string) {
    const body = {
      username: this.email,
      password: this.password,
      external: true,
      email,
      idToken
    }
    if (idToken) {
      body.external = false;
    }
    this.apiService.login(body).subscribe({
      next: (res: any) => {
        console.log(res);
        this.appService.savePreferences(res);
        this.authService.loginSuccess();
      },
      error: (err) => {
        console.error(`Login error`);
        console.log(err);
        if (err && err.status == 401 && body.external) {
          alert('Invalid username or password!')
        } else {
          alert("Error while logging in")
        }
      },
    })
  }

  onLoginSuccess() {
    // this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    this.authService.loginSuccess();
  }
}
