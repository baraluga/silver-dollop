import { Component, input } from '@angular/core';
import { Insight } from '../../models/insight.interface';

@Component({
  selector: 'app-insight-display',
  imports: [],
  templateUrl: './insight-display.html',
  styleUrl: './insight-display.scss'
})
export class InsightDisplay {
  readonly insight = input<Insight | null>(null);
}