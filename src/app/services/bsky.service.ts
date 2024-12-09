// @ts-ignore
import { Injectable } from '@angular/core';
import {AccountService} from './account.service';
import {
  of,
  switchMap,
  from,
  EMPTY,
  Observable,
  tap,
  map,
  ReplaySubject,
  Subject,
  expand,
  takeWhile, last, mergeMap, toArray, catchError, config
} from 'rxjs';
import {Account} from '../dto/account';
import {BSkyFeed, BSkyFeedItem, BSkyFollow, BSkyFollows, BSkyLogin, RichFollow} from '../dto/BskyTypes';
import {HttpClient} from '@angular/common/http';
import {AtUri} from '../dto/AtUri';


@Injectable({
  providedIn: 'root'
})
export class BskyService {

  private _login: BSkyLogin | null = null;
  private _account: Account | null = null;

  private _ok: Subject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private accountService: AccountService,
    private http: HttpClient
  ) {
    this._ok.next(false);

    accountService.account().pipe(
      switchMap(account => {
        this._login = null;
        this._ok.next(false);
        if (account) {
          this._account = account;
          return this.login(account.name, account.password);
        }
        return EMPTY;
      })
    ).subscribe(account => {
      this._login = account;
      this._ok.next(true);
    });

  }

  ok(): Subject<boolean> {
    return this._ok;
  }

  canRun(): boolean  {
    return !!this._login && !!this._account;
  }

  private login(name: string, password: string): Observable<BSkyLogin> {
    const storedLogin = localStorage.getItem('login');
    if (storedLogin) {
      const loginData: LoginData = JSON.parse(storedLogin);
      if (loginData.login.handle === this._account?.name && new Date().getTime() - new Date(loginData.loginDate).getTime() < 1000 * 60 * 60 * 6) {
        return of(loginData.login);
      }
    }
    return this.http.post<BSkyLogin>(
      "https://bsky.social/xrpc/com.atproto.server.createSession",
      {
        identifier: name,
        password: password
      }
    ).pipe(
      tap(login => {
        localStorage.setItem('login', JSON.stringify({
          loginDate: new Date(),
          login: login
        }));
      })
    )
  }

  getFollows(): Observable<BSkyFollow[]> {
    if (!this.canRun()) {
      return EMPTY;
    }

    const profiles: BSkyFollow[] = [];

    return of(null).pipe(
      switchMap(() => this.getFollowsInternal(undefined)),
      expand((response) => {
        if (response.cursor) {
          return this.getFollowsInternal(response.cursor);
        }
        return EMPTY;
      }),
      tap((response) => {
        profiles.push(...response.follows);
      }),
      takeWhile((response) => !!response.cursor, true),
      last(),
      map(() => profiles)
    );
  }

  getFollowsInternal(cursor?: string) {
    if (!this.canRun()) {
      return EMPTY;
    }
    const cursorParam = cursor ? `&cursor=${ cursor }` : '';
    return this.http.get<BSkyFollows>(
      `https://bsky.social/xrpc/app.bsky.graph.getFollows?limit=100&actor=${ this._account!.name }${ cursorParam }`,
      {
        headers: {
          "Authorization": `Bearer ${ this._login!.accessJwt }`
        }
      }
    )
  }

  getRichFollow(follows: BSkyFollow[]): Observable<RichFollow[]> {
    const totalFollows = follows.length;
    let index = 0; // Track the progress of processing

    return from(follows).pipe(
      mergeMap((follow) => {
          return this.getFeedData(follow.handle).pipe(
            map(feed => {
              return {
                follow: follow,
                feed: feed
              }
            })
          )
      }
      ),
      tap(() => index++),
      takeWhile(() => index < totalFollows, true),
      toArray()
    );
  }

  getFeedData(handle: string): Observable<BSkyFeed> {
    return this.http.get<BSkyFeed>(
      `https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed?actor=${ handle }&limit=30`,
      {
        headers: {
          "Authorization": `Bearer ${ this._login!.accessJwt }`
        }
      }
    ).pipe(
      map(response => {

        function convertItem(item: BSkyFeedItem): BSkyFeedItem {
          return {
            post: {
              indexedAt: new Date(item.post.indexedAt),
              author: { handle: item.post.author.handle }
            }
          }
        }

        function convertFeed(response: BSkyFeed): BSkyFeed {
          return {
            feed: response.feed.map(item => convertItem(item)),
            cursor: response.cursor
          }
        }

        return convertFeed(response)
      }),
      catchError(err => {
        console.error(err);
        return of({feed: [], cursor: ''});
      })
    )
  }

  deleteRecord(atUri: AtUri) {
    return this.http.post(
      "https://bsky.social/xrpc/com.atproto.repo.deleteRecord",
      atUri,
      {
        headers: {
          "Authorization": `Bearer ${ this._login!.accessJwt }`
        }
      }
    )
  }
}

interface LoginData {
  loginDate: Date,
  login: BSkyLogin
}


