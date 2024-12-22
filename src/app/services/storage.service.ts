import { Injectable } from '@angular/core';
import {BSkySubject, RichFollow} from '../dto/BskyTypes';
import * as LZString from 'lz-string';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  public getStarterPackUrl(): string | null {
    return this.getString('starterPackUrl');
  }

  public setStarterPackUrl(url: string): void {
    this.setString('starterPackUrl', url);
  }

  public getStarterPackUri(): string | null {
    return this.getString('starterPackUri');
  }

  public setStarterPackUri(url: string): void {
    this.setString('starterPackUri', url);
  }

  public getStarterPackListUri(): string | null {
    return this.getString('starterPackListUri');
  }

  public setStarterPackListUri(url: string): void {
    this.setString('starterPackListUri', url);
  }

  public getStarterPackName(): string | null {
    return this.getString('starterPackName');
  }

  public setStarterPackName(url: string): void {
    this.setString('starterPackName', url);
  }

  public getString(key: string): string | null {
    const value = localStorage.getItem(key);
    if (value) {
      return value;
    }
    return null;
  }

  public setString(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

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
    return this.getArray('follows');
  }

  public setFollows(follows: RichFollow[]): void {
    this.setArray('follows', follows);
  }

  public getSubjects(): BSkySubject[] {
    return this.getArray('subjects');
  }

  public setSubjects(subjects: BSkySubject[]): void {
    this.setArray('subjects', subjects);
  }

  public getArray<T>(key: string): T[] {
    const all: T[] = [];
    let i = 0;
    let run = true;
    while (run) {
      const item = localStorage.getItem(`${key}_chunk_${i}`);
      if (item) {
        const chunk = JSON.parse(item);
        all.push(...chunk);
        i++;
      } else {
        run = false;
      }
    }
    return all;
  }

  public setArray<T>(key: string, value: T[]): void {
    let i = 0;
    let run = true;
    while (run) {
      const item = localStorage.getItem(`${key}_chunk_${i}`);
      if (item) {
        localStorage.removeItem(`${key}_chunk_${i}`);
        i++;
      } else {
        run = false;
      }
    }
    const chunkSize = 10;
    const chunks = Math.ceil(value.length / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const chunk = value.slice(i * chunkSize, (i + 1) * chunkSize);
      localStorage.setItem(`${key}_chunk_${i}`, JSON.stringify(chunk));
    }
  }

}
