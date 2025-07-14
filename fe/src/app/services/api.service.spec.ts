import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { Insight, InsightRequest } from '../models/insight.interface';
import { env } from '../../environments/env';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get insights successfully', () => {
    const mockInsight: Insight = {
      title: 'Test Title',
      summary: 'Test Summary',
      insights: ['Insight 1', 'Insight 2']
    };

    const query = 'test query';

    service.getInsights(query).subscribe(insight => {
      expect(insight).toEqual(mockInsight);
    });

    const req = httpMock.expectOne(`${env.apiUrl}/api/insights`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ query } as InsightRequest);
    req.flush(mockInsight);
  });

  it('should handle server errors', () => {
    const query = 'test query';
    const errorResponse = {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Server error occurred'
    };

    service.getInsights(query).subscribe({
      next: () => fail('Expected error'),
      error: (error) => {
        expect(error.message).toBe('Server error occurred');
      }
    });

    const req = httpMock.expectOne(`${env.apiUrl}/api/insights`);
    req.flush(errorResponse, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle network errors', () => {
    const query = 'test query';

    service.getInsights(query).subscribe({
      next: () => fail('Expected error'),
      error: (error) => {
        expect(error.message).toContain('Network error');
      }
    });

    const req = httpMock.expectOne(`${env.apiUrl}/api/insights`);
    req.error(new ErrorEvent('Network error', { message: 'Connection failed' }));
  });

  it('should handle timeout', () => {
    jest.useFakeTimers();
    const query = 'test query';

    service.getInsights(query).subscribe({
      next: () => fail('Expected timeout'),
      error: (error) => {
        expect(error.name).toBe('TimeoutError');
      }
    });

    const req = httpMock.expectOne(`${env.apiUrl}/api/insights`);
    
    // Advance time beyond timeout
    jest.advanceTimersByTime(31000);
    
    jest.useRealTimers();
  });
});