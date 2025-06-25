import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UserProfileComponent } from './features/users/components/user-profile/user-profile.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { UserSearchComponent } from './pages/user-search/user-search.component';
import { ProfileUpdateComponent } from './pages/profile-update/profile-update.component';
import { AboutComponent } from './pages/about/about.component';
import { FeedExploreComponent } from './pages/feed-explore/feed-explore.component';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { RootRedirectGuard } from './guards/root-redirect.guard';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { CreatePostPageComponent } from './pages/create-post/create-post.component';

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
    path: 'create/post',
    component: CreatePostPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user/search',
    component: UserSearchComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'feed/explore',
    component: FeedExploreComponent,
    canActivate: [AuthGuard],
  },
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
