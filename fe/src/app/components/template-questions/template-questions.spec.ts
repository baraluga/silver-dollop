import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateQuestions } from './template-questions';

describe('TemplateQuestions', () => {
  let component: TemplateQuestions;
  let fixture: ComponentFixture<TemplateQuestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateQuestions]
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateQuestions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have predefined questions', () => {
    expect(component['questions'].length).toBe(2);
    expect(component['questions'][0].category).toBe('Availability');
    expect(component['questions'][1].category).toBe('Billability');
  });

  it('should emit question text when selected', () => {
    spyOn(component.onQuestionSelect, 'emit');
    const question = component['questions'][0];
    
    component['selectQuestion'](question);
    
    expect(component.onQuestionSelect.emit).toHaveBeenCalledWith(question.text);
  });

  it('should display questions in template', () => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    
    expect(buttons.length).toBe(2);
    expect(compiled.textContent).toContain('Availability');
    expect(compiled.textContent).toContain('Billability');
  });

  it('should call selectQuestion when button clicked', () => {
    spyOn(component as any, 'selectQuestion');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    
    buttons[0].click();
    
    expect((component as any).selectQuestion).toHaveBeenCalledWith(component['questions'][0]);
  });
});