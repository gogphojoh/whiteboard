import { Component } from '@angular/core';
import { WhiteboardComponent } from './whiteboard/whiteboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WhiteboardComponent],
  template: `<app-whiteboard></app-whiteboard>`,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }
  `]
})
export class AppComponent {
  title = 'Whiteboard App';
}
