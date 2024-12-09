import {Component, EventEmitter, Output} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {AccountService} from '../../services/account.service';
import {CommonModule} from '@angular/common';
import {Account} from '../../dto/account';
import {RouterLink} from '@angular/router';
import {BurgerMenuComponent} from '../burger-menu/burger-menu.component';

@Component({
  selector: 'app-top-menu',
  imports: [MatToolbarModule, MatButtonModule, MatMenuModule, CommonModule, RouterLink, BurgerMenuComponent],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.css'
})
export class TopMenuComponent {

  @Output() sideMenuOpened: EventEmitter<boolean> = new EventEmitter();

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

  menuOpenedAction(opened: boolean) {
    this.sideMenuOpened.next(opened);
  }
}
