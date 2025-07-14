import { Component, output } from '@angular/core';

interface TemplateQuestion {
  id: string;
  text: string;
  category: string;
}

@Component({
  selector: 'app-template-questions',
  imports: [],
  templateUrl: './template-questions.html',
  styleUrl: './template-questions.scss'
})
export class TemplateQuestions {
  protected readonly questions: TemplateQuestion[] = [
    {
      id: 'availability',
      text: "What is our team's current availability for the next sprint?",
      category: 'Availability'
    },
    {
      id: 'billability',
      text: 'Which team members have the highest billability this month?',
      category: 'Billability'
    }
  ];
  
  readonly onQuestionSelect = output<string>();
  
  protected selectQuestion(question: TemplateQuestion) {
    this.onQuestionSelect.emit(question.text);
  }
}