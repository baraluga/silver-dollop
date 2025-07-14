import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Insight, InsightRequest, ApiError } from '../models/insight.interface';
import { env } from '../../environments/env';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = env.apiUrl;
  private readonly requestTimeout = 30000; // 30 seconds

  constructor(private http: HttpClient) {}

  getInsights(query: string): Observable<Insight> {
    const request: InsightRequest = { query };
    
    return this.http.post<Insight>(`${this.baseUrl}/api/insights`, request)
      .pipe(
        timeout(this.requestTimeout),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = this.extractErrorMessage(error);
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
  
  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return this.getClientErrorMessage(error.error);
    }
    return this.getServerErrorMessage(error);
  }
  
  private getClientErrorMessage(errorEvent: ErrorEvent): string {
    return `Network error: ${errorEvent.message}`;
  }
  
  private getServerErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiError;
    return this.getApiMessageOrDefault(apiError, error);
  }
  
  private getApiMessageOrDefault(apiError: ApiError, error: HttpErrorResponse): string {
    if (this.hasValidApiError(apiError)) {
      return apiError.message;
    }
    return this.getDefaultServerError(error);
  }
  
  private hasValidApiError(apiError: ApiError): boolean {
    return Boolean(apiError && apiError.message);
  }
  
  private getDefaultServerError(error: HttpErrorResponse): string {
    return `Server error: ${error.status} ${error.statusText}`;
  }
}