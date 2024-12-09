import {AfterViewChecked, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Logger} from './logger';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-console',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './console.component.html',
  styleUrl: './console.component.scss'
})
export class ConsoleComponent implements AfterViewChecked {

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  @Input() logger!: Logger;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  clean() {
    this.logger.clr();
  }
}
