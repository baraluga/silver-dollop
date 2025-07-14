import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-display',
  imports: [],
  templateUrl: './error-display.html',
  styleUrl: './error-display.scss'
})
export class ErrorDisplay {
  readonly errorMessage = input<string | null>(null);
}