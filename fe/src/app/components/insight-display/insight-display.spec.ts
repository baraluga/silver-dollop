import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsightDisplay } from './insight-display';
import { Insight } from '../../models/insight.interface';
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

  it('should not display thought process section when thoughtProcess is not provided', () => {
    const mockInsight: Insight = {
      title: 'Test Title',
      summary: 'Test Summary',
      insights: ['Insight 1']
    };

    componentRef.setInput('insight', mockInsight);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('details')).toBeNull();
    expect(compiled.textContent).not.toContain('AI reasoning');
  });

  it('should display thought process section when thoughtProcess is provided', () => {
    const mockInsight: Insight = {
      title: 'Test Title',
      summary: 'Test Summary',
      insights: ['Insight 1'],
      thoughtProcess: 'This is how I analyzed the data and came to these conclusions.'
    };

    componentRef.setInput('insight', mockInsight);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const detailsElement = compiled.querySelector('details');
    expect(detailsElement).toBeTruthy();
    expect(compiled.textContent).toContain('AI reasoning');
    expect(compiled.textContent).toContain('This is how I analyzed the data and came to these conclusions.');
  });

  it('should have thought process collapsed by default', () => {
    const mockInsight: Insight = {
      title: 'Test Title',
      summary: 'Test Summary',
      insights: ['Insight 1'],
      thoughtProcess: 'Analysis reasoning here.'
    };

    componentRef.setInput('insight', mockInsight);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const detailsElement = compiled.querySelector('details');
    expect(detailsElement.hasAttribute('open')).toBeFalsy();
  });

  it('should expand thought process when summary is clicked', () => {
    const mockInsight: Insight = {
      title: 'Test Title',
      summary: 'Test Summary',
      insights: ['Insight 1'],
      thoughtProcess: 'Analysis reasoning here.'
    };

    componentRef.setInput('insight', mockInsight);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const summaryElement = compiled.querySelector('summary');
    summaryElement.click();
    fixture.detectChanges();

    const detailsElement = compiled.querySelector('details');
    expect(detailsElement.hasAttribute('open')).toBeTruthy();
  });

  it('should handle empty thoughtProcess gracefully', () => {
    const mockInsight: Insight = {
      title: 'Test Title',
      summary: 'Test Summary',
      insights: ['Insight 1'],
      thoughtProcess: ''
    };

    componentRef.setInput('insight', mockInsight);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('details')).toBeNull();
  });

  it('should display thought process with proper styling', () => {
    const mockInsight: Insight = {
      title: 'Test Title',
      summary: 'Test Summary',
      insights: ['Insight 1'],
      thoughtProcess: 'Detailed analysis here.'
    };

    componentRef.setInput('insight', mockInsight);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const thoughtProcessDiv = compiled.querySelector('details div');
    expect(thoughtProcessDiv.classList.contains('text-xs')).toBeTruthy();
    expect(thoughtProcessDiv.classList.contains('text-gray-600')).toBeTruthy();
    expect(thoughtProcessDiv.classList.contains('pl-4')).toBeTruthy();
  });
});