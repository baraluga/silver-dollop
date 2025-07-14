import { Component, signal, ViewChild } from '@angular/core';
import { Layout } from './components/layout/layout';
import { QueryInput } from './components/query-input/query-input';
import { TemplateQuestions } from './components/template-questions/template-questions';

@Component({
  selector: 'app-root',
  imports: [Layout, QueryInput, TemplateQuestions],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  @ViewChild(QueryInput) queryInput!: QueryInput;
  protected readonly title = signal('Team Resource Insights');
  
  protected handleQuery(query: string) {
    console.log('Query submitted:', query);
  }
  
  protected handleQuestionSelect(question: string) {
    this.queryInput.setQuery(question);
  }
}
