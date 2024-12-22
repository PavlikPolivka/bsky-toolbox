import { Routes } from '@angular/router';
import {SettingsComponent} from './components/settings/settings.component';
import {HomeComponent} from './components/home/home.component';
import {CleanupComponent} from './components/cleanup/cleanup.component';
import {StarterPackUnfollowComponent} from './components/starter-pack-unfollow/starter-pack-unfollow.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'cleanup', component: CleanupComponent },
  { path: 'starterPackUnfollow', component: StarterPackUnfollowComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];
