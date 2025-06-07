import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { HomeComponent } from './features/dashboard/components/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './core/guards/auth.guard';
import { UserProfileComponent } from './features/users/components/user-profile/user-profile.component';
import { RootRedirectGuard } from './core/guards/root-redirect.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { UserSearchComponent } from './features/users/components/user-search/user-search.component';
import { ProfileUpdateComponent } from './pages/profile-update/profile-update.component';
import { AboutComponent } from './pages/about/about.component';

export const appRoutes: Routes = [
  {
    path: '',
    canActivate: [RootRedirectGuard],
    children: [],
  },
  // AUTH
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard],
  },
  // NAV MENU
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'search',
    component: UserSearchComponent,
    canActivate: [AuthGuard],
  },
  // {
  //   path: 'feed/explore',
  //   component: ,
  //   canActivate: [AuthGuard],
  // },
  {
    path: 'about',
    component: AboutComponent,
    canActivate: [AuthGuard],
  },
  // PROFILE
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'profile/update',
    component: ProfileUpdateComponent,
    canActivate: [AuthGuard],
  },
  // USERS
  {
    path: 'user/:username',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', component: PageNotFoundComponent },
];
