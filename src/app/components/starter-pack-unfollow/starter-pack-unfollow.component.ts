import { Component } from '@angular/core';
import {ConsoleComponent} from '../console/console.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Logger} from '../console/logger';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {BskyService} from '../../services/bsky.service';
import {StorageService} from '../../services/storage.service';
import {AccountService} from '../../services/account.service';
import {Account} from '../../dto/account';
import {EMPTY, switchMap} from 'rxjs';
import {NgIf} from '@angular/common';
import {BSkySubject} from '../../dto/BskyTypes';
import {AtUri} from '../../dto/AtUri';

@Component({
  selector: 'app-starter-pack-unfollow',
  imports: [
    ConsoleComponent,
    ReactiveFormsModule,
    MatButton,
    MatDivider,
    MatFormField,
    MatInput,
    MatLabel,
    FormsModule,
    NgIf
  ],
  templateUrl: './starter-pack-unfollow.component.html',
  styleUrl: './starter-pack-unfollow.component.scss'
})
export class StarterPackUnfollowComponent {
  logger = new Logger();
  starterPackUrl: string = '';
  starterPackUri: string = '';
  starterPackListUri: string = '';
  starterPackName: string = '';
  subjects: BSkySubject[] = [];
  account: Account | null = null;

  constructor(
    public bskyService: BskyService,
    public storageService: StorageService,
    public accountService: AccountService
  ) {
    this.accountService.account().subscribe(account => this.account = account);
    this.starterPackUrl = this.storageService.getStarterPackUrl() ?? '';
    this.starterPackUri = this.storageService.getStarterPackUri() ?? '';
    this.starterPackListUri = this.storageService.getStarterPackListUri() ?? '';
    this.starterPackName = this.storageService.getStarterPackName() ?? '';
    this.subjects = this.storageService.getSubjects() ?? [];
  }

  startLookup() {
    this.logger.log(`Looking at starter pack with url ${ this.starterPackUrl }`);
    this.storageService.setStarterPackUrl(this.starterPackUrl);
    this.bskyService.getStarterPackAtFromTheShareUrl(this.starterPackUrl).pipe(
      switchMap(url => {
        const at = this.bskyService.getStarterPackAt(url);
        if (at) {
          this.starterPackUri = at;
          this.storageService.setStarterPackUri(at);
          return this.bskyService.getStarterPack(at);
        }
        return EMPTY;
      }),
      switchMap(starterPack => {
        this.logger.log(`Found starter pack: ${ starterPack?.record?.name }`);
        if (starterPack?.list?.uri) {
          this.starterPackListUri = starterPack.list.uri;
          this.storageService.setStarterPackListUri(starterPack.list.uri);
          this.starterPackName = starterPack.record.name;
          this.storageService.setStarterPackName(starterPack.record.name);
          return this.bskyService.getListSubjects(this.starterPackListUri);
        }
        return EMPTY;
      }),
      switchMap(subjects => {
        this.logger.log(`With ${ subjects?.length } accounts.`);
        this.subjects = subjects;
        this.storageService.setSubjects(subjects);
        return EMPTY;
      })
    ).subscribe();
  }

  unloadData() {
    this.starterPackName = '';
    this.storageService.setStarterPackName('');
    this.starterPackUrl = '';
    this.storageService.setStarterPackUrl('');
    this.starterPackUri = '';
    this.storageService.setStarterPackUri('');
    this.starterPackListUri = '';
    this.storageService.setStarterPackListUri('');
    this.subjects = [];
    this.storageService.setSubjects([]);
  }

  listAccounts() {
    if (this.subjects?.length > 0) {
      this.subjects.forEach(subject => {
        const following = subject.viewer.following ? 'Following.' : 'Not following.'
        this.logger.log(`User: ${subject.handle}. ${following}`);
      });
    } else {
      this.logger.log('No account in this starter pack.');
    }
  }

  unfollowAll() {
    this.logger.log('Unfollowing...');
    this.subjects.forEach(subject => {
      if (subject.viewer.following) {
        this.bskyService.deleteRecord(new AtUri(subject.viewer.following)).subscribe(() => {
          this.logger.log(`Unfollowed user: ${subject.handle}`);
        });
      } else {
        this.logger.log(`User: ${subject.handle} was not followed.`);
      }
    });
  }

  getFollowingCount() {
    const following = this.subjects?.filter(s=> s.viewer.following);
    if (following) {
      return following.length;
    }
    return 0;
  }
}
