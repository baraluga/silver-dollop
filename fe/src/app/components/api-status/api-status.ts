import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

interface HealthCheck {
  status: string;
  message: string;
  provider?: string;
}

interface HealthResponse {
  status: string;
  checks: {
    backend: HealthCheck;
    tempo: HealthCheck;
    jira: HealthCheck;
    ai: HealthCheck;
  };
}

@Component({
  selector: 'app-api-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-status.html',
  styleUrls: ['./api-status.scss']
})
export class ApiStatusComponent implements OnInit {
  healthStatus: HealthResponse | null = null;
  isLoading = true;
  isConfirmedHealthy = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadHealthStatus();
  }

  private loadHealthStatus(): void {
    this.isLoading = true;
    this.apiService.getHealthStatus().subscribe({
      next: (response) => {
        this.handleHealthResponse(response);
      },
      error: (error) => {
        this.handleLoadingError(error);
      }
    });
  }

  private handleHealthResponse(response: HealthResponse): void {
    this.healthStatus = response;
    this.isLoading = false;
    this.checkConfirmedHealth();
  }

  private handleLoadingError(error: unknown): void {
    console.error('Error loading health status:', error);
    this.isLoading = false;
  }

  private checkConfirmedHealth(): void {
    if (!this.healthStatus) return;
    this.isConfirmedHealthy = this.healthStatus.status === 'healthy';
  }

  isHealthy(service: keyof HealthResponse['checks']): boolean {
    const check = this.getServiceCheck(service);
    return check?.status === 'healthy';
  }

  getStatusMessage(service: keyof HealthResponse['checks']): string {
    const check = this.getServiceCheck(service);
    return this.extractMessage(check);
  }

  private getServiceCheck(service: keyof HealthResponse['checks']): HealthCheck | undefined {
    return this.healthStatus?.checks[service];
  }

  private extractMessage(check: HealthCheck | undefined): string {
    if (!check) return '';
    return check.message;
  }

  // eslint-disable-next-line complexity
  getAIProvider(): string {
    const aiCheck = this.getServiceCheck('ai');
    return aiCheck?.provider || 'AI';
  }

  hasErrors(): boolean {
    if (!this.healthStatus) return false;
    return Object.values(this.healthStatus.checks).some(check => check.status !== 'healthy');
  }
}