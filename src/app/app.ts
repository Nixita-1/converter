import { Component, signal } from '@angular/core';
import { ImageToTextComponent } from './components/image-to-text/image-to-text';

@Component({
  selector: 'app-root',
  imports: [ImageToTextComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('imageToText');
}
