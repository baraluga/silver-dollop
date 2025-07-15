import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiStatusComponent } from './api-status';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';

describe('ApiStatusComponent', () => {
  let component: ApiStatusComponent;
  let fixture: ComponentFixture<ApiStatusComponent>;
  let mockApiService: jest.Mocked<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = {
      getHealthStatus: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ApiStatusComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ApiStatusComponent);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display healthy status when all APIs are working', () => {
    const healthyResponse = {
      status: 'healthy',
      checks: {
        backend: { status: 'healthy', message: 'Backend is running' },
        tempo: { status: 'healthy', message: 'Tempo API is accessible' },
        jira: { status: 'healthy', message: 'JIRA API is accessible' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(healthyResponse));

    fixture.detectChanges();

    expect(component.healthStatus).toEqual(healthyResponse);
    expect(component.isHealthy('backend')).toBe(true);
    expect(component.isHealthy('tempo')).toBe(true);
    expect(component.isHealthy('jira')).toBe(true);
  });

  it('should display error status when Tempo API fails', () => {
    const errorResponse = {
      status: 'degraded',
      checks: {
        backend: { status: 'healthy', message: 'Backend is running' },
        tempo: { status: 'error', message: 'Tempo API connection failed. Check TEMPO_API_TOKEN in .env file' },
        jira: { status: 'healthy', message: 'JIRA API is accessible' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(errorResponse));

    fixture.detectChanges();

    expect(component.isHealthy('tempo')).toBe(false);
    expect(component.getStatusMessage('tempo')).toBe('Tempo API connection failed. Check TEMPO_API_TOKEN in .env file');
  });

  it('should handle API service error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Network error');
    
    mockApiService.getHealthStatus.mockReturnValue(throwError(error));

    fixture.detectChanges();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading health status:', error);
    consoleErrorSpy.mockRestore();
  });
});