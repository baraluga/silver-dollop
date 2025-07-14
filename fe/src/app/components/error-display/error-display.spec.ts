import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorDisplay } from './error-display';
import { ComponentRef } from '@angular/core';

describe('ErrorDisplay', () => {
  let component: ErrorDisplay;
  let fixture: ComponentFixture<ErrorDisplay>;
  let componentRef: ComponentRef<ErrorDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorDisplay]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorDisplay);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display when error message is null', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('div')).toBeNull();
  });

  it('should display error when message is provided', () => {
    componentRef.setInput('errorMessage', 'Test error message');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Unable to get insights');
    expect(compiled.textContent).toContain('Test error message');
  });

  it('should display error icon', () => {
    componentRef.setInput('errorMessage', 'Test error');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('svg');
    expect(icon).toBeTruthy();
  });
});