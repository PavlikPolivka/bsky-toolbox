import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DeviceService} from '../../services/device.service';

@Component({
  selector: 'app-burger-menu',
  imports: [],
  templateUrl: './burger-menu.component.html',
  styleUrl: './burger-menu.component.scss'
})
export class BurgerMenuComponent implements OnInit{
  @Input() init : boolean = false;
  @Output() opened = new EventEmitter<boolean>();

  active = false;

  constructor(private deviceService: DeviceService) {
  }

  ngOnInit() {
    this.active = this.init || false;
    if (this.deviceService.isSmallerScreen()) {
      this.active = false;
      this.opened.emit(false);
    } else {
      this.active = true;
      this.opened.emit(true);
    }
  }

  onBurgerClicked() {
    this.active = !this.active;
    this.opened.emit(this.active);
  }
}
