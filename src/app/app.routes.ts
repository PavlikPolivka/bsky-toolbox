import { Routes } from '@angular/router';
import {SettingsComponent} from './components/settings/settings.component';
import {HomeComponent} from './components/home/home.component';
import {CleanupComponent} from './components/cleanup/cleanup.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'cleanup', component: CleanupComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];
