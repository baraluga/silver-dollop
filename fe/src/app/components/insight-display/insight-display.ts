import { Component, input } from '@angular/core';

export interface Insight {
  title: string;
  summary: string;
  insights: string[];
}

@Component({
  selector: 'app-insight-display',
  imports: [],
  templateUrl: './insight-display.html',
  styleUrl: './insight-display.scss'
})
export class InsightDisplay {
  readonly insight = input<Insight | null>(null);
}