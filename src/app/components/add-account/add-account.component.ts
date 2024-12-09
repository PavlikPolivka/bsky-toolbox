// @ts-ignore
import { Component } from '@angular/core';
// @ts-ignore
import {CommonModule} from '@angular/common';
// @ts-ignore
import {MatFormField, MatLabel} from '@angular/material/form-field';
// @ts-ignore
import {MatInput} from '@angular/material/input';
// @ts-ignore
import {FormsModule} from '@angular/forms';
// @ts-ignore
import {MatButton} from '@angular/material/button';
import {AccountService} from '../../services/account.service';

@Component({
  selector: 'app-add-account',
  imports: [CommonModule, MatFormField, MatInput, MatLabel, FormsModule, MatButton],
  templateUrl: './add-account.component.html',
  styleUrl: './add-account.component.scss'
})
export class AddAccountComponent {

  constructor(private accountService: AccountService) {
  }

  name: string = '';
  password: string = '';

  addAccount() {
    const account = { name: this.name, password: this.password };
    this.accountService.addAccount(account);
    this.accountService.switchAccount(account);
    this.name = '';
    this.password = '';
  }
}
