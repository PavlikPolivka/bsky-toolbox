// @ts-ignore
import {Injectable} from '@angular/core';
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
  takeWhile, last, mergeMap, toArray, catchError, config, subscribeOn, first
} from 'rxjs';
import {Account} from '../dto/account';
import {
  BSkyFeed,
  BSkyFeedItem,
  BSkyFollow,
  BSkyFollows, BSkyListResponse,
  BSkyLogin,
  BSkyStarterPack, BSkyStarterPackResponse, BSkySubject,
  RichFollow
} from '../dto/BskyTypes';
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

  canRun(): boolean {
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
    const cursorParam = cursor ? `&cursor=${cursor}` : '';
    return this.http.get<BSkyFollows>(
      `https://bsky.social/xrpc/app.bsky.graph.getFollows?limit=100&actor=${this._account!.name}${cursorParam}`,
      {
        headers: {
          "Authorization": `Bearer ${this._login!.accessJwt}`
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
      `https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed?actor=${handle}&limit=30`,
      {
        headers: {
          "Authorization": `Bearer ${this._login!.accessJwt}`
        }
      }
    ).pipe(
      map(response => {

        function convertItem(item: BSkyFeedItem): BSkyFeedItem {
          return {
            post: {
              indexedAt: new Date(item.post.indexedAt),
              author: {handle: item.post.author.handle}
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
          "Authorization": `Bearer ${this._login!.accessJwt}`
        }
      }
    )
  }

  getStarterPackAtFromTheShareUrl(shareUrl: string): Observable<string> {
    return this.http.get<Location>(
      `https://location-header.ppolivka.com/api/proxy?url=${encodeURIComponent(shareUrl)}`
    ).pipe(
      first(),
      map(response => {
        return response.location;
      }),
      catchError(error => {
        return EMPTY;
      })
    )
  }

  getStarterPackAt(location: string): string | null {
    // https://bsky.app/start/did:plc:mozqqiaodbvfpbghqk5pjw2y/3lcggg3lfkt2z
    // at://did:plc:mozqqiaodbvfpbghqk5pjw2y/app.bsky.graph.starterpack/3lcggg3lfkt2z
    try {
      const at = location.split('did')[1].split('/');
      return `at://did${at[0]}/app.bsky.graph.starterpack/${at[1]}`;
    } catch (error) {
      return null;
    }
  }

  getStarterPack(at: string): Observable<BSkyStarterPack> {
    return this.http.get<BSkyStarterPackResponse>(
      `https://bsky.social/xrpc/app.bsky.graph.getStarterPack?starterPack=${encodeURIComponent(at)}`,
      {
        headers: {
          "Authorization": `Bearer ${this._login!.accessJwt}`
        }
      }
    ).pipe(
      map(response => {
        return response.starterPack;
      })
    )
  }

  getListSubjects(listUri: string): Observable<BSkySubject[]> {
    if (!this.canRun()) {
      return EMPTY;
    }

    const subjects: BSkySubject[] = [];

    return of(null).pipe(
      switchMap(() => this.getListSubjectsInternal(listUri, undefined)),
      expand((response) => {
        if (response.cursor) {
          return this.getListSubjectsInternal(listUri, response.cursor);
        }
        return EMPTY;
      }),
      tap((response) => {
        subjects.push(...response.items.map(item => item.subject));
      }),
      takeWhile((response) => !!response.cursor, true),
      last(),
      map(() => subjects),
      map(subjects => subjects.map(subject => {
        return {
          did: subject.did,
          handle: subject.handle,
          viewer: {
            following: subject.viewer.following
          }
        };
      }))
    );
  }

  getListSubjectsInternal(listUri: string, cursor?: string) {
    if (!this.canRun()) {
      return EMPTY;
    }
    const cursorParam = cursor ? `&cursor=${cursor}` : '';
    return this.http.get<BSkyListResponse>(
      `https://bsky.social/xrpc/app.bsky.graph.getList?limit=100&list=${encodeURIComponent(listUri)}${cursorParam}`,
      {
        headers: {
          "Authorization": `Bearer ${this._login!.accessJwt}`
        }
      }
    )
  }

}

interface LoginData {
  loginDate: Date,
  login: BSkyLogin
}

interface Location {
  location: string
}


