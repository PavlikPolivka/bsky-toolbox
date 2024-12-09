import {BehaviorSubject, Observable} from 'rxjs';

export class Logger {

  private logSubject = new BehaviorSubject<string[]>([]);
  logs$: Observable<string[]> = this.logSubject.asObservable();

  log(message: string): void {
    const currentLogs = this.logSubject.value;
    this.logSubject.next([...currentLogs, message]);
  }

  clr(): void {
    this.logSubject.next([]);
  }

}
