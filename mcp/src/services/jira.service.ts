import axios from 'axios';
import { JiraUser } from '../types/jira.types';

export class JiraService {
  private readonly baseUrl: string;
  private readonly email: string;
  private readonly apiToken: string;

  constructor() {
    this.baseUrl = this.getBaseUrl();
    this.email = this.getEmail();
    this.apiToken = this.getApiToken();
  }

  private getBaseUrl(): string {
    const url = process.env.JIRA_BASE_URL;
    if (!url) {
      throw new Error('JIRA_BASE_URL environment variable is required');
    }
    return url;
  }

  private getEmail(): string {
    const email = process.env.JIRA_EMAIL;
    if (!email) {
      throw new Error('JIRA_EMAIL environment variable is required');
    }
    return email;
  }

  private getApiToken(): string {
    const token = process.env.JIRA_API_TOKEN;
    if (!token) {
      throw new Error('JIRA_API_TOKEN environment variable is required');
    }
    return token;
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`;
  }

  async getUser(accountId: string): Promise<JiraUser> {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/3/user`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        params: {
          accountId
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Jira API error: ${error.response?.status} ${error.response?.statusText}`);
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<JiraUser> {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Jira API error: ${error.response?.status} ${error.response?.statusText}`);
      }
      throw error;
    }
  }

  async getMultipleUsers(accountIds: string[]): Promise<Record<string, string>> {
    const userDirectory: Record<string, string> = {};
    
    for (const accountId of accountIds) {
      try {
        const user = await this.getUser(accountId);
        userDirectory[accountId] = user.displayName;
      } catch (error) {
        userDirectory[accountId] = 'Unknown User';
      }
    }

    return userDirectory;
  }
}