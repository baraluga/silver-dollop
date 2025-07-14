import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { env } from '../../environments/env';
import { Insight, InsightRequest } from '../models/insight.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = env.apiUrl;

  constructor(private http: HttpClient) {}

  getInsights(query: string): Observable<Insight> {
    const request: InsightRequest = { query };

    return this.http.post<Insight>(`${this.baseUrl}/api/insights`, request);
  }
}
