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
        jira: { status: 'healthy', message: 'JIRA API is accessible' },
        gemini: { status: 'healthy', message: 'Gemini AI is accessible' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(healthyResponse));

    fixture.detectChanges();

    expect(component.healthStatus).toEqual(healthyResponse);
    expect(component.isHealthy('backend')).toBe(true);
    expect(component.isHealthy('tempo')).toBe(true);
    expect(component.isHealthy('jira')).toBe(true);
    expect(component.isHealthy('gemini')).toBe(true);
  });

  it('should display error status when Tempo API fails', () => {
    const errorResponse = {
      status: 'degraded',
      checks: {
        backend: { status: 'healthy', message: 'Backend is running' },
        tempo: { status: 'error', message: 'Tempo API connection failed. Check TEMPO_API_TOKEN in .env file' },
        jira: { status: 'healthy', message: 'JIRA API is accessible' },
        gemini: { status: 'healthy', message: 'Gemini AI is accessible' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(errorResponse));

    fixture.detectChanges();

    expect(component.isHealthy('tempo')).toBe(false);
    expect(component.getStatusMessage('tempo')).toBe('Tempo API connection failed. Check TEMPO_API_TOKEN in .env file');
    expect(component.hasErrors()).toBe(true);
  });

  it('should handle API service error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Network error');
    
    mockApiService.getHealthStatus.mockReturnValue(throwError(error));

    fixture.detectChanges();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading health status:', error);
    consoleErrorSpy.mockRestore();
  });

  it('should display error status when Gemini AI fails', () => {
    const errorResponse = {
      status: 'degraded',
      checks: {
        backend: { status: 'healthy', message: 'Backend is running' },
        tempo: { status: 'healthy', message: 'Tempo API is accessible' },
        jira: { status: 'healthy', message: 'JIRA API is accessible' },
        gemini: { status: 'error', message: 'Gemini AI connection failed. Check GEMINI_API_KEY in .env file' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(errorResponse));

    fixture.detectChanges();

    expect(component.isHealthy('gemini')).toBe(false);
    expect(component.getStatusMessage('gemini')).toBe('Gemini AI connection failed. Check GEMINI_API_KEY in .env file');
    expect(component.hasErrors()).toBe(true);
  });

  it('should return false for hasErrors when all APIs are healthy', () => {
    const healthyResponse = {
      status: 'healthy',
      checks: {
        backend: { status: 'healthy', message: 'Backend is running' },
        tempo: { status: 'healthy', message: 'Tempo API is accessible' },
        jira: { status: 'healthy', message: 'JIRA API is accessible' },
        gemini: { status: 'healthy', message: 'Gemini AI is accessible' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(healthyResponse));

    fixture.detectChanges();

    expect(component.hasErrors()).toBe(false);
  });

  it('should return empty string for getStatusMessage when healthStatus is null', () => {
    component.healthStatus = null;
    
    expect(component.getStatusMessage('tempo')).toBe('');
  });

  it('should start with loading state', () => {
    expect(component.isLoading).toBe(true);
    expect(component.isConfirmedHealthy).toBe(false);
  });

  it('should set loading to false after successful health check', () => {
    const healthyResponse = {
      status: 'healthy',
      checks: {
        backend: { status: 'healthy', message: 'Backend is running' },
        tempo: { status: 'healthy', message: 'Tempo API is accessible' },
        jira: { status: 'healthy', message: 'JIRA API is accessible' },
        gemini: { status: 'healthy', message: 'Gemini AI is accessible' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(healthyResponse));

    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.isConfirmedHealthy).toBe(true);
  });

  it('should set loading to false after error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Network error');
    
    mockApiService.getHealthStatus.mockReturnValue(throwError(error));

    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.isConfirmedHealthy).toBe(false);
    
    consoleErrorSpy.mockRestore();
  });

  it('should set isConfirmedHealthy to false when status is degraded', () => {
    const degradedResponse = {
      status: 'degraded',
      checks: {
        backend: { status: 'healthy', message: 'Backend is running' },
        tempo: { status: 'error', message: 'Tempo API connection failed' },
        jira: { status: 'healthy', message: 'JIRA API is accessible' },
        gemini: { status: 'healthy', message: 'Gemini AI is accessible' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(degradedResponse));

    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.isConfirmedHealthy).toBe(false);
  });

  it('should handle checkConfirmedHealth with null healthStatus', () => {
    component.healthStatus = null;
    
    component['checkConfirmedHealth']();
    
    expect(component.isConfirmedHealthy).toBe(false);
  });
});