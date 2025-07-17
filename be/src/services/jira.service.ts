import axios from "axios";
import { JiraUser } from "../types/jira.interfaces";

export class JiraService {
  private readonly baseUrl = process.env.JIRA_BASE_URL;
  private readonly auth = process.env.JIRA_AUTH_64;

  async getUser(accountId: string): Promise<JiraUser> {
    return this.makeRequest(() =>
      axios.get(`${this.baseUrl}/rest/api/3/user`, {
        headers: { Authorization: `Basic ${this.auth}` },
        params: { accountId },
      }),
    );
  }

  async getUsersByAccountIds(accountIds: string[]): Promise<JiraUser[]> {
    const users = await Promise.all(accountIds.map((id) => this.getUser(id)));
    return users;
  }

  private async makeRequest<T>(
    requestFn: () => Promise<{ data: T }>,
  ): Promise<T> {
    return this.executeWithRetry(requestFn);
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<{ data: T }>,
  ): Promise<T> {
    const response = await requestFn();
    return response.data;
  }

  async getUserData(): Promise<unknown> {
    const response = await axios.get(`${this.baseUrl}/rest/api/3/myself`, {
      headers: {
        Authorization: `Basic ${this.auth}`,
      },
    });

    return response.data;
  }
}

export const jiraService = new JiraService();
