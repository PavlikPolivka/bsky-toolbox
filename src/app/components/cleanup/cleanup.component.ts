import {Component} from '@angular/core';
import {Logger} from '../console/logger';
import {ConsoleComponent} from '../console/console.component';
import {MatDivider} from '@angular/material/divider';
import {MatButton} from '@angular/material/button';
import {BskyService} from '../../services/bsky.service';
import {RichFollow} from '../../dto/BskyTypes';
import {StorageService} from '../../services/storage.service';
import {CommonModule} from '@angular/common';
import {switchMap, tap} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {AccountService} from '../../services/account.service';
import {Account} from '../../dto/account';
import {AtUri} from '../../dto/AtUri';

@Component({
  selector: 'app-cleanup',
  imports: [ConsoleComponent, MatDivider, MatButton, CommonModule, FormsModule, MatInput, MatFormField, MatLabel],
  templateUrl: './cleanup.component.html',
  styleUrl: './cleanup.component.scss'
})
export class CleanupComponent {

  logger = new Logger();
  gatherDate: Date | null = null;
  follows: RichFollow[] = [];
  filteredFollows: Filtered[] = [];
  account: Account | null = null;

  daysOfInactivity: number = 15;
  repostRatio: number = 0.5;

  constructor(
    public bskyService: BskyService,
    public storageService: StorageService,
    public accountService: AccountService
  ) {
    this.gatherDate = this.storageService.getGatherDate();
    this.follows = this.storageService.getFollows();
    this.accountService.account().subscribe(account => this.account = account);
  }

  startGathering() {
    this.logger.log('Starting to gather data...');
    this.bskyService.getFollows()
      .pipe(
        tap(follows => {
          this.logger.log(`Got ${follows.length} follows.`);
          this.logger.log(`Fetching feed data for each of those.`);
        }),
        switchMap(follows => {
          return this.bskyService.getRichFollow(follows);
        })
      ).subscribe(follows => {
        // follows = follows.map(f => this.filterByTypeRecursive(f));
        this.logger.log(`Got ${follows.length} users feeds.`);
        this.gatherDate = new Date();
        this.storageService.setFollows(follows);
        this.storageService.setGatherDate(new Date());
        this.follows = follows;
    });
  }

  private filterByTypeRecursive<T extends object>(data: any): T {
    if (Array.isArray(data)) {
      // If the data is an array, recursively filter each item
      return data.map(item => this.filterByTypeRecursive(item)) as unknown as T;
    }

    if (typeof data === 'object' && data !== null) {
      const filtered = {} as T;

      for (const key in filtered) {
        if (data.hasOwnProperty(key)) {
          // Recursively filter nested objects or assign primitive values
          if (typeof data[key] === 'object' && data[key] !== null) {
            // @ts-ignore
            filtered[key] = this.filterByTypeRecursive(data[key]);
          } else {
            filtered[key] = data[key];
          }
        }
      }

      return filtered;
    }
    return data as T;
  }

  filter() {
    this.logger.log(`Filtering follows with ${this.daysOfInactivity} days of inactivity or ${this.repostRatio} repost ratio.`);
    this.filteredFollows = this.follows.map(f => {
      return {
        rich: f,
        reason: ''
      }
    }).filter(f => {
      const orderedFeed = f.rich.feed.feed.sort((a, b) => new Date(b.post.indexedAt).getTime() - new Date(a.post.indexedAt).getTime());
      const daysSinceLastPost = (this.gatherDate!.getTime() - new Date(orderedFeed[0].post.indexedAt).getTime()) / (1000 * 60 * 60 * 24);
      const reposts = f.rich.feed.feed.filter(p => p.post.author.handle !== f.rich.follow.handle).length;
      const repostRatio = reposts / f.rich.feed.feed.length;
      if (daysSinceLastPost > this.daysOfInactivity) {
        f.reason += `Days since last post: ${daysSinceLastPost}. `;
        return true;
      }
      if (repostRatio > this.repostRatio) {
        f.reason += `Repost ratio: ${repostRatio}. `;
        return true;
      }
      return false;
    });
    this.logger.log(`Filtered ${this.filteredFollows.length} follows.`);
  }

  showFiltered() {
    if (this.filteredFollows?.length > 0) {
      this.filteredFollows.forEach(f => {
        this.logger.log(`User: ${f.rich.follow.handle}. Reason: ${f.reason}`);
      });
    } else {
      this.logger.log('No filtered follows to show.');
    }
  }

  unfollow() {
    this.logger.log('Unfollowing users...');
    this.filteredFollows.forEach(f => {
      this.bskyService.deleteRecord(new AtUri(f.rich.follow.viewer.following)).subscribe(() => {
        this.logger.log(`Unfollowed user: ${f.rich.follow.handle}`);
      });
    });
  }
}

interface Filtered {
  rich: RichFollow;
  reason: string;
}
