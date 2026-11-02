import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';

import { Permission, ALL_PERMISSIONS } from '../models/permission.model';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially have null user', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('should authenticate valid user', async () => {
    const success = await service.login('admin@tryharder.com', 'admin123');
    expect(success).toBe(true);
    expect(service.currentUser()?.email).toBe('admin@tryharder.com');
  });

  it('should authenticate another user with bcrypt hashed password', async () => {
    const success = await service.login('john@tryharder.com', 'gamer123');
    expect(success).toBe(true);
    expect(service.currentUser()?.email).toBe('john@tryharder.com');
  });

  it('should reject invalid credentials', async () => {
    const success = await service.login('admin@tryharder.com', 'wrongpassword');
    expect(success).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should check permissions properly', async () => {
    await service.login('admin@tryharder.com', 'admin123');

    for (const permission of ALL_PERMISSIONS) {
      expect(service.hasPermission(permission)).toBe(true);
    }

    expect(service.hasPermission('UNKNOWN_PERMISSION' as Permission)).toBe(false);
  });

  it('should clear user and navigate on logout', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    await service.login('admin@tryharder.com', 'admin123');
    service.logout();
    expect(service.currentUser()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
