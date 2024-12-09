// @ts-ignore
import {Injectable} from '@angular/core';

import {Account} from '../dto/account';
import {ReplaySubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private _account: Subject<Account | null> = new ReplaySubject<Account | null>();
  private _accounts: Subject<Account[]> = new ReplaySubject<Account[]>();

  constructor() {
    this._account.next(this.getCurrentAccount());
    this._accounts.next(this.listSupportedAccounts());
  }

  public account(): Subject<Account | null> {
    return this._account;
  }

  public accounts(): Subject<Account[]> {
   return this._accounts;
  }

  private getCurrentAccount(): Account | null {
    const current = localStorage.getItem('currentAccount');
    if (current) {
      return  JSON.parse(current);
    }
    return null;
  }

  private listSupportedAccounts(): Account[] {
    const accounts = localStorage.getItem('supportedAccounts');
    if (accounts) {
      return JSON.parse(accounts);
    }
    return [];
  }

  public switchAccount(account: Account): void {
    localStorage.setItem('currentAccount', JSON.stringify(account));
    this._account.next(account);
  }

  public addAccount(account: Account): void {
    const current = this.listSupportedAccounts();
    localStorage.setItem('supportedAccounts', JSON.stringify([...current, account]));
    this._accounts.next([...current, account]);
  }

  public removeAccount(account: Account): void {
    const current = this.listSupportedAccounts();
    const newAccounts = current.filter(a => a.name !== account.name);
    localStorage.setItem('supportedAccounts', JSON.stringify(newAccounts));
    this._accounts.next(newAccounts);
  }

}
