import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  isSmallerScreen(): boolean {
    return window.matchMedia('(max-width: 1000px)').matches; // Adjust width as needed
  }

}
