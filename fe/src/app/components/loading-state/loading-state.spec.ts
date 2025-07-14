import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingState } from './loading-state';

describe('LoadingState', () => {
  let component: LoadingState;
  let fixture: ComponentFixture<LoadingState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingState]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingState);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading text', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Analyzing your team resources...');
    expect(compiled.textContent).toContain('This may take a few seconds');
  });

  it('should display spinner', () => {
    const compiled = fixture.nativeElement;
    const spinner = compiled.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should display progress dots', () => {
    const compiled = fixture.nativeElement;
    const dots = compiled.querySelectorAll('.animate-pulse');
    expect(dots.length).toBe(3);
  });
});