import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsightDisplay, Insight } from './insight-display';
import { ComponentRef } from '@angular/core';

describe('InsightDisplay', () => {
  let component: InsightDisplay;
  let fixture: ComponentFixture<InsightDisplay>;
  let componentRef: ComponentRef<InsightDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsightDisplay]
    }).compileComponents();

    fixture = TestBed.createComponent(InsightDisplay);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display when insight is null', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('div')).toBeNull();
  });

  it('should display insight when provided', () => {
    const mockInsight: Insight = {
      title: 'Test Title',
      summary: 'Test Summary',
      insights: ['Insight 1', 'Insight 2']
    };

    componentRef.setInput('insight', mockInsight);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test Title');
    expect(compiled.textContent).toContain('Test Summary');
    expect(compiled.textContent).toContain('Insight 1');
    expect(compiled.textContent).toContain('Insight 2');
  });

  it('should display bullet points for insights', () => {
    const mockInsight: Insight = {
      title: 'Test',
      summary: 'Summary',
      insights: ['Item 1', 'Item 2', 'Item 3']
    };

    componentRef.setInput('insight', mockInsight);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const bulletPoints = compiled.querySelectorAll('.w-1\\.5');
    expect(bulletPoints.length).toBe(3);
  });
});