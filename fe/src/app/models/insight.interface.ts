export interface Insight {
  title: string;
  summary: string;
  insights: string[];
}

export interface InsightRequest {
  query: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}