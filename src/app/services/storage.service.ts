import { Injectable } from '@angular/core';
import {RichFollow} from '../dto/BskyTypes';
import * as LZString from 'lz-string';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  public getGatherDate(): Date | null {
    const gatherDate = localStorage.getItem('gatherDate');
    if (gatherDate) {
      return new Date(gatherDate);
    }
    return null;
  }

  public setGatherDate(date: Date): void {
    localStorage.setItem('gatherDate', date.toISOString());
  }

  public getFollows(): RichFollow[] {
    const allFollows: RichFollow[] = [];
    let i = 0;
    let run = true;
    while (run) {
      const item = localStorage.getItem(`follows_chunk_${i}`);
      if (item) {
        const chunk = JSON.parse(item);
        allFollows.push(...chunk);
        i++;
      } else {
        run = false;
      }
    }
    return allFollows;
  }

  public setFollows(follows: RichFollow[]): void {
    let i = 0;
    let run = true;
    while (run) {
      const item = localStorage.getItem(`follows_chunk_${i}`);
      if (item) {
        localStorage.removeItem(`follows_chunk_${i}`);
        i++;
      } else {
        run = false;
      }
    }
    const chunkSize = 10;
    const chunks = Math.ceil(follows.length / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const chunk = follows.slice(i * chunkSize, (i + 1) * chunkSize);
      localStorage.setItem(`follows_chunk_${i}`, JSON.stringify(chunk));
    }
  }

}
