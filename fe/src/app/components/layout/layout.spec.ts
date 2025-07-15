import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Layout } from './layout';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;
  let mockApiService: jest.Mocked<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = {
      getHealthStatus: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
  });

  it('should create', () => {
    const healthResponse = {
      status: 'healthy',
      checks: {
        backend: { status: 'healthy', message: 'Backend is running' },
        tempo: { status: 'healthy', message: 'Tempo API is accessible' },
        jira: { status: 'healthy', message: 'JIRA API is accessible' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(healthResponse));

    expect(component).toBeTruthy();
  });

  it('should render API status component', () => {
    const healthResponse = {
      status: 'healthy',
      checks: {
        backend: { status: 'healthy', message: 'Backend is running' },
        tempo: { status: 'healthy', message: 'Tempo API is accessible' },
        jira: { status: 'healthy', message: 'JIRA API is accessible' }
      }
    };

    mockApiService.getHealthStatus.mockReturnValue(of(healthResponse));

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-api-status')).toBeTruthy();
  });
});