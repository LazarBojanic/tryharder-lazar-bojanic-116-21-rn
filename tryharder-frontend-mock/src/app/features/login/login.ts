import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto mt-16 max-w-md rounded border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-bold text-gray-800">Sign in to Tryharder</h2>
      <p class="mb-5 text-sm text-gray-500">Enter your credentials to access your library</p>
      <form (ngSubmit)="onSubmit()" class="flex flex-col gap-3">
        <div>
          <label for="email" class="mb-1 block text-sm font-semibold text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            [(ngModel)]="email"
            name="email"
            required
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label for="password" class="mb-1 block text-sm font-semibold text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            [(ngModel)]="password"
            name="password"
            required
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        @if (error()) {
          <div class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {{ error() }}
          </div>
        }
        <button
          type="submit"
          class="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Sign in
        </button>
      </form>
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
