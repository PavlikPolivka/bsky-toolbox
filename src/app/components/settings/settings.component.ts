// @ts-ignore
import { Component } from '@angular/core';
import {AccountService} from '../../services/account.service';
// @ts-ignore
import {CommonModule} from '@angular/common';
import {AddAccountComponent} from '../add-account/add-account.component';
import {Account} from '../../dto/account';
// @ts-ignore
import {MatListModule} from '@angular/material/list';
// @ts-ignore
import {MatButtonModule} from '@angular/material/button';
// @ts-ignore
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, AddAccountComponent, MatListModule, MatButtonModule, MatIcon],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

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

  isCurrent(account: Account) {
    return this.currentAccount && this.currentAccount.name === account.name;
  }

  removeAccount(account: Account) {
    this.accountService.removeAccount(account);
  }
}
