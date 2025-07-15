import axios from 'axios';
import { JiraUser } from '../types/jira.interfaces';

export class JiraService {
  private readonly baseUrl = process.env.JIRA_BASE_URL;
  private readonly auth = process.env.JIRA_AUTH_64;

  async getUser(accountId: string): Promise<JiraUser> {
    return this.makeRequest(() => 
      axios.get(`${this.baseUrl}/rest/api/3/user`, {
        headers: { 'Authorization': `Basic ${this.auth}` },
        params: { accountId }
      })
    );
  }

  async getUsersByAccountIds(accountIds: string[]): Promise<JiraUser[]> {
    const users = await Promise.all(
      accountIds.map(id => this.getUser(id))
    );
    return users;
  }

  private async makeRequest<T>(requestFn: () => Promise<{ data: T }>): Promise<T> {
    return this.executeWithRetry(requestFn, 0);
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<{ data: T }>, 
    attempts: number
  ): Promise<T> {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error: unknown) {
      return this.handleRequestError(error, { requestFn, attempts });
    }
  }

  private async handleRequestError<T>(
    error: unknown, 
    context: { requestFn: () => Promise<{ data: T }>; attempts: number }
  ): Promise<T> {
    if (this.shouldRetry(error, context.attempts)) {
      await this.delay(1000 * (context.attempts + 1));
      return this.executeWithRetry(context.requestFn, context.attempts + 1);
    }
    
    throw error;
  }

  private shouldRetry(error: unknown, attempts: number): boolean {
    return this.isRateLimitError(error) && attempts < 2;
  }

  private isRateLimitError(error: unknown): boolean {
    return this.getErrorStatus(error) === 429;
  }

  private getErrorStatus(error: unknown): number | undefined {
    const errorObj = error as { response?: { status?: number } };
    return this.extractStatusFromResponse(errorObj?.response);
  }

  private extractStatusFromResponse(response?: { status?: number }): number | undefined {
    return response?.status;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getUserData(): Promise<unknown> {
    const response = await axios.get(`${this.baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${this.auth}`
      }
    });

    return response.data;
  }
}

export const jiraService = new JiraService();