import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { GameLibrarySearchComponent } from './features/game-library/search/search';
import { GameLibraryCreateComponent } from './features/game-library/create/create';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'library/search', component: GameLibrarySearchComponent, canActivate: [authGuard] },
  { path: 'library/create', component: GameLibraryCreateComponent, canActivate: [authGuard] },
  { path: 'dashboard', redirectTo: 'library/search', pathMatch: 'full' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
