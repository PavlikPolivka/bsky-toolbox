// @ts-ignore
import { Component } from '@angular/core';
// @ts-ignore
import {RouterModule} from '@angular/router';
// @ts-ignore
import {MatSidenavModule} from '@angular/material/sidenav';
import {FooterComponent} from './components/footer/footer.component';
import {SideMenuComponent} from './components/side-menu/side-menu.component';
import {TopMenuComponent} from './components/top-menu/top-menu.component';

@Component({
  selector: 'app-root',
  imports: [
    TopMenuComponent,
    SideMenuComponent,
    FooterComponent,
    RouterModule,
    MatSidenavModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bsky-toolbox';
}
