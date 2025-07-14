import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { App } from './app';
import { ApiService } from './services/api.service';
import { Insight } from './models/insight.interface';

describe('App', () => {
  let mockApiService: jest.Mocked<ApiService>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockApiService = {
      getInsights: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [App, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: mockApiService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
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
    expect(app['errorMessage']()).toBeNull();
  });

  it('should handle successful query submission', () => {
    const mockInsight: Insight = {
      title: 'Test Insight',
      summary: 'Test Summary',
      insights: ['Test item 1', 'Test item 2']
    };
    
    mockApiService.getInsights.mockReturnValue(of(mockInsight));
    
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['queryInput'] = { setSubmitting: jest.fn() } as any;
    
    app['handleQuery']('test query');
    
    expect(app['isLoading']()).toBe(false);
    expect(app['currentInsight']()).toEqual(mockInsight);
    expect(app['errorMessage']()).toBeNull();
    expect(app['queryInput'].setSubmitting).toHaveBeenCalledWith(false);
    expect(mockApiService.getInsights).toHaveBeenCalledWith('test query');
    expect(consoleLogSpy).toHaveBeenCalledWith('Query submitted:', 'test query');
  });

  it('should handle API error', () => {
    const errorMessage = 'API Error occurred';
    mockApiService.getInsights.mockReturnValue(throwError(() => new Error(errorMessage)));
    
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['queryInput'] = { setSubmitting: jest.fn() } as any;
    
    app['handleQuery']('test query');
    
    expect(app['isLoading']()).toBe(false);
    expect(app['currentInsight']()).toBeNull();
    expect(app['errorMessage']()).toBe(errorMessage);
    expect(app['queryInput'].setSubmitting).toHaveBeenCalledWith(false);
    expect(consoleLogSpy).toHaveBeenCalledWith('Query submitted:', 'test query');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
