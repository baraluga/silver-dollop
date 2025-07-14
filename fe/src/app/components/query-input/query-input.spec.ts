import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { QueryInput } from './query-input';

describe('QueryInput', () => {
  let component: QueryInput;
  let fixture: ComponentFixture<QueryInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryInput, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(QueryInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty query', () => {
    expect(component['query']()).toBe('');
    expect(component['isSubmitting']()).toBe(false);
  });

  it('should update query when updateQuery is called', () => {
    component['updateQuery']('test query');
    expect(component['query']()).toBe('test query');
  });

  it('should set query when setQuery is called', () => {
    component.setQuery('new query');
    expect(component['query']()).toBe('new query');
  });

  it('should clear query when clearQuery is called', () => {
    component.setQuery('some text');
    component.clearQuery();
    expect(component['query']()).toBe('');
  });

  it('should set submitting state', () => {
    component.setSubmitting(true);
    expect(component['isSubmitting']()).toBe(true);
  });

  it('should emit query on submit when valid', () => {
    const emitSpy = jest.spyOn(component.onQuerySubmit, 'emit');
    component.setQuery('test query');
    
    component['submit']();
    
    expect(emitSpy).toHaveBeenCalledWith('test query');
    expect(component['isSubmitting']()).toBe(true);
  });

  it('should not emit when query is empty', () => {
    const emitSpy = jest.spyOn(component.onQuerySubmit, 'emit');
    component.setQuery('   ');
    
    component['submit']();
    
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not emit when already submitting', () => {
    const emitSpy = jest.spyOn(component.onQuerySubmit, 'emit');
    component.setQuery('test query');
    component.setSubmitting(true);
    
    component['submit']();
    
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should have template questions', () => {
    expect(component['templateQuestions'].length).toBe(2);
    expect(component['templateQuestions'][0].text).toContain('availability');
    expect(component['templateQuestions'][1].text).toContain('billability');
  });

  it('should set query when template selected', () => {
    const question = component['templateQuestions'][0];
    
    component['selectTemplate'](question);
    
    expect(component['query']()).toBe(question.text);
  });

  it('should display template chips with hint label', () => {
    const compiled = fixture.nativeElement;
    const chips = compiled.querySelectorAll('button[type="button"]');
    
    expect(chips.length).toBe(2);
    expect(compiled.textContent).toContain('Quick questions:');
    expect(compiled.textContent).toContain('availability');
    expect(compiled.textContent).toContain('billability');
  });
});