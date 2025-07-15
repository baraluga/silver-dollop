import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

interface HealthCheck {
  status: string;
  message: string;
}

interface HealthResponse {
  status: string;
  checks: {
    backend: HealthCheck;
    tempo: HealthCheck;
    jira: HealthCheck;
    gemini: HealthCheck;
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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadHealthStatus();
  }

  private loadHealthStatus(): void {
    this.apiService.getHealthStatus().subscribe({
      next: (response) => {
        this.healthStatus = response;
      },
      error: (error) => {
        console.error('Error loading health status:', error);
      }
    });
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

  hasErrors(): boolean {
    if (!this.healthStatus) return false;
    return Object.values(this.healthStatus.checks).some(check => check.status !== 'healthy');
  }
}