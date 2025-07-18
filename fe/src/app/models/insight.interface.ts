export interface Insight {
  title: string;
  summary: string;
  insights: string[];
  thoughtProcess?: string;
}

export interface InsightRequest {
  query: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}