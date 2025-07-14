import { Component, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TemplateQuestion {
  id: string;
  text: string;
}

@Component({
  selector: 'app-query-input',
  imports: [FormsModule],
  templateUrl: './query-input.html',
  styleUrl: './query-input.scss'
})
export class QueryInput {
  protected readonly query = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly templateQuestions: TemplateQuestion[] = [
    {
      id: 'availability',
      text: "What is our team's current availability for the next sprint?"
    },
    {
      id: 'billability', 
      text: 'Which team members have the highest billability this month?'
    }
  ];
  
  readonly onQuerySubmit = output<string>();
  
  protected submit() {
    const queryText = this.query().trim();
    if (queryText && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.onQuerySubmit.emit(queryText);
    }
  }
  
  protected updateQuery(value: string) {
    this.query.set(value);
  }
  
  public setQuery(value: string) {
    this.query.set(value);
  }
  
  public clearQuery() {
    this.query.set('');
  }
  
  public setSubmitting(submitting: boolean) {
    this.isSubmitting.set(submitting);
  }
  
  protected selectTemplate(question: TemplateQuestion) {
    this.query.set(question.text);
  }
}