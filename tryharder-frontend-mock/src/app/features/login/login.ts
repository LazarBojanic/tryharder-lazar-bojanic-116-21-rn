import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="mx-auto mt-16 max-w-md">
      <mat-card>
        <mat-card-header class="mb-4">
          <mat-card-title class="!text-xl !font-bold">Sign in to Tryharder</mat-card-title>
          <mat-card-subtitle>Enter your credentials to access your library</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" class="flex flex-col gap-3">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input
                id="email"
                matInput
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="admin@tryharder.com"
              />
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input
                id="password"
                matInput
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                placeholder="••••••••"
              />
              <mat-icon matSuffix>lock</mat-icon>
            </mat-form-field>

            @if (error()) {
              <div class="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {{ error() }}
              </div>
            }

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="w-full !py-2"
            >
              <mat-icon>login</mat-icon>
              <span>Sign in</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
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
