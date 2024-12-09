// @ts-ignore
import { Component } from '@angular/core';
// @ts-ignore
import {RouterModule} from '@angular/router';
// @ts-ignore
import {MatToolbarModule} from '@angular/material/toolbar';
// @ts-ignore
import {MatListModule} from '@angular/material/list';
import {AccountService} from '../../services/account.service';
// @ts-ignore
import {MatDivider} from '@angular/material/divider';
// @ts-ignore
import {MatIcon} from '@angular/material/icon';
import {Account} from '../../dto/account';
// @ts-ignore
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-side-menu',
  imports: [MatListModule, MatToolbarModule, RouterModule, MatDivider, MatIcon, NgIf],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css'
})
export class SideMenuComponent {

  account: Account | null = null;

  constructor(private accountService: AccountService) {
    this.accountService.account().subscribe(account => {
      this.account = account;
    });
  }



}
