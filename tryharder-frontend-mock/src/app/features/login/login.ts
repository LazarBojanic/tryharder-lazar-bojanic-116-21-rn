import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-box">
      <h2>Sign in to Tryharder</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-row">
          <label for="email">Email</label>
          <input id="email" type="email" [(ngModel)]="email" name="email" class="text-input" />
        </div>
        <div class="form-row">
          <label for="password">Password</label>
          <input id="password" type="text" [(ngModel)]="password" name="password" class="text-input" />
        </div>
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        <button type="submit" class="primary-btn">Sign in</button>
      </form>
    </div>
  `,
  styles: [`
    .login-box {
      width: 400px;
      margin: 60px auto;
      padding: 24px;
      background: white;
      border: 1px solid #ddd;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      font-family: Arial, sans-serif;
    }
    .login-box h2 {
      margin: 0 0 20px 0;
      color: #333;
      text-align: center;
    }
    .form-row {
      margin-bottom: 14px;
    }
    .form-row label {
      display: block;
      margin-bottom: 4px;
      font-weight: bold;
      font-size: 13px;
      color: #444;
    }
    .text-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #bbb;
      box-sizing: border-box;
      font-size: 14px;
    }
    .text-input:focus {
      outline: none;
      border-color: #3f51b5;
    }
    .primary-btn {
      width: 100%;
      padding: 10px;
      background-color: #3f51b5;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 15px;
      font-weight: bold;
    }
    .primary-btn:hover {
      background-color: #303f9f;
    }
    .error {
      color: red;
      font-size: 13px;
      margin: 0 0 12px 0;
    }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal('');

  async onSubmit(): Promise<void> {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('All fields are required.');
      return;
    }
    const success = await this.auth.login(this.email, this.password);
    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Invalid email or password.');
    }
  }
}
