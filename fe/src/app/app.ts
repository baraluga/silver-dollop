import { Component, signal, ViewChild } from '@angular/core';
import { Layout } from './components/layout/layout';
import { QueryInput } from './components/query-input/query-input';
import { InsightDisplay } from './components/insight-display/insight-display';
import { LoadingState } from './components/loading-state/loading-state';
import { ErrorDisplay } from './components/error-display/error-display';
import { ApiService } from './services/api.service';
import { Insight } from './models/insight.interface';

@Component({
  selector: 'app-root',
  imports: [Layout, QueryInput, InsightDisplay, LoadingState, ErrorDisplay],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  @ViewChild(QueryInput) queryInput!: QueryInput;
  
  protected readonly title = signal('Team Resource Insights');
  protected readonly currentInsight = signal<Insight | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  
  constructor(private apiService: ApiService) {}
  
  protected handleQuery(query: string) {
    console.log('Query submitted:', query);
    
    // Reset state
    this.isLoading.set(true);
    this.currentInsight.set(null);
    this.errorMessage.set(null);
    
    // Call real API
    this.apiService.getInsights(query).subscribe({
      next: (insight) => {
        this.currentInsight.set(insight);
        this.isLoading.set(false);
        this.queryInput.setSubmitting(false);
      },
      error: (error) => {
        console.error('API call failed:', error);
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
        this.queryInput.setSubmitting(false);
      }
    });
  }
}
