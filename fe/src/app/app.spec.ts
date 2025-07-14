import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Team Resource Insights');
  });

  it('should have initial state', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    expect(app['title']()).toBe('Team Resource Insights');
    expect(app['currentInsight']()).toBeNull();
    expect(app['isLoading']()).toBe(false);
  });

  it('should handle query submission', () => {
    jest.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    // Mock the queryInput ViewChild to avoid undefined error
    app['queryInput'] = { setSubmitting: jest.fn() } as any;
    
    app['handleQuery']('test query');
    
    expect(app['isLoading']()).toBe(true);
    expect(app['currentInsight']()).toBeNull();
    
    jest.advanceTimersByTime(2000);
    
    expect(app['isLoading']()).toBe(false);
    expect(app['currentInsight']()).not.toBeNull();
    expect(app['currentInsight']()?.title).toBe('Team Resource Analysis');
    expect(app['queryInput'].setSubmitting).toHaveBeenCalledWith(false);
    
    jest.useRealTimers();
  });
});
