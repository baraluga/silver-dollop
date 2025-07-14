import { Component, signal } from '@angular/core';
import { Layout } from './components/layout/layout';
import { QueryInput } from './components/query-input/query-input';
import { InsightDisplay, Insight } from './components/insight-display/insight-display';

@Component({
  selector: 'app-root',
  imports: [Layout, QueryInput, InsightDisplay],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Team Resource Insights');
  protected readonly currentInsight = signal<Insight | null>(null);
  
  protected handleQuery(query: string) {
    console.log('Query submitted:', query);
    
    // Mock insight for testing
    const mockInsight: Insight = {
      title: 'Team Resource Analysis',
      summary: 'Based on current data, here are the key insights about your team resources:',
      insights: [
        'Sarah Johnson has the highest availability with 32 hours for next sprint',
        'Development team billability is at 78% this month, above target',
        'UI/UX capacity may be constrained with only 16 hours available',
        'Consider redistributing workload to optimize team efficiency'
      ]
    };
    
    this.currentInsight.set(mockInsight);
  }
}
