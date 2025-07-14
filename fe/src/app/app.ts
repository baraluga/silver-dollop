import { Component, signal } from '@angular/core';
import { Layout } from './components/layout/layout';
import { QueryInput } from './components/query-input/query-input';

@Component({
  selector: 'app-root',
  imports: [Layout, QueryInput],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Team Resource Insights');
  
  protected handleQuery(query: string) {
    console.log('Query submitted:', query);
  }
}
