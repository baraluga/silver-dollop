import axios from "axios";
import { JiraUser, JiraProject } from "../types/jira.interfaces";

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

  async getProjectsByKeys(projectKeys: string[]): Promise<Record<string, JiraProject>> {
    if (projectKeys.length === 0) {
      return {};
    }

    const uniqueKeys = [...new Set(projectKeys)];
    const projects = await this.fetchProjectsBatch(uniqueKeys);
    return this.buildProjectDictionary(projects);
  }

  private async fetchProjectsBatch(projectKeys: string[]): Promise<JiraProject[]> {
    const projects: JiraProject[] = [];
    
    for (const key of projectKeys) {
      try {
        const project = await this.getProject(key);
        projects.push(project);
      } catch (error) {
        console.warn(`Failed to fetch project ${key}:`, error);
      }
    }
    
    return projects;
  }

  private async getProject(projectKey: string): Promise<JiraProject> {
    return this.makeRequest(() =>
      axios.get(`${this.baseUrl}/rest/api/3/project/${projectKey}`, {
        headers: { Authorization: `Basic ${this.auth}` },
      }),
    );
  }

  private buildProjectDictionary(projects: JiraProject[]): Record<string, JiraProject> {
    const dictionary: Record<string, JiraProject> = {};
    projects.forEach((project) => {
      dictionary[project.key] = project;
    });
    return dictionary;
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
