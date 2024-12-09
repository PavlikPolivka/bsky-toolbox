// @ts-ignore
import {Component, Input} from '@angular/core';
import {Logger} from './logger';
// @ts-ignore
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-console',
  imports: [CommonModule],
  templateUrl: './console.component.html',
  styleUrl: './console.component.scss'
})
export class ConsoleComponent {

  @Input() logger!: Logger;

}
