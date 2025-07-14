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
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      const apiError = error.error as ApiError;
      if (apiError && apiError.message) {
        errorMessage = apiError.message;
      } else {
        errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}