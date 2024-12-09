// @ts-ignore
import { Component } from '@angular/core';
// @ts-ignore
import {MatMenuModule} from '@angular/material/menu';
// @ts-ignore
import {MatButtonModule} from '@angular/material/button';
// @ts-ignore
import {MatToolbarModule} from '@angular/material/toolbar';
import {AccountService} from '../../services/account.service';
// @ts-ignore
import {CommonModule} from '@angular/common';
import {Account} from '../../dto/account';
// @ts-ignore
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-top-menu',
  imports: [MatToolbarModule, MatButtonModule, MatMenuModule, CommonModule, RouterLink],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.css'
})
export class TopMenuComponent {

  currentAccount: Account | null = null;
  accounts: Account[] = [];

  constructor(private accountService: AccountService) {
    accountService.account().subscribe(account => {
      this.currentAccount = account;
    });
    accountService.accounts().subscribe(accounts => {
      this.accounts = accounts;
    });
  }

  switch(account: Account) {
    this.accountService.switchAccount(account);
  }

  isCurrent(account: Account) {
    return this.currentAccount?.name === account.name;
  }
}
