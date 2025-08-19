import axios from 'axios';
import { TempoWorklog } from '../types/tempo.types';

export class TempoService {
  private readonly baseUrl = 'https://api.tempo.io/4';
  private readonly apiToken: string;

  constructor() {
    this.apiToken = this.getApiToken();
  }

  private getApiToken(): string {
    const token = process.env.TEMPO_API_TOKEN;
    if (!token) {
      throw new Error('TEMPO_API_TOKEN environment variable is required');
    }
    return token;
  }

  async getWorklogs(from: string, to: string): Promise<TempoWorklog[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/worklogs`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          from,
          to,
          limit: 1000
        }
      });

      return response.data.results || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Tempo API error: ${error.response?.status} ${error.response?.statusText}`);
      }
      throw error;
    }
  }

  filterUserWorklogs(userId: string, worklogs: TempoWorklog[]): TempoWorklog[] {
    return worklogs.filter(worklog => worklog.author.accountId === userId);
  }

  calculateTotalHours(worklogs: TempoWorklog[]): number {
    const totalSeconds = worklogs.reduce((sum, worklog) => sum + worklog.timeSpentSeconds, 0);
    return this.convertSecondsToHours(totalSeconds);
  }

  calculateBillableHours(worklogs: TempoWorklog[]): number {
    const billableSeconds = worklogs.reduce((sum, worklog) => sum + worklog.billableSeconds, 0);
    return this.convertSecondsToHours(billableSeconds);
  }

  private convertSecondsToHours(seconds: number): number {
    return Math.round((seconds / 3600) * 100) / 100;
  }

  calculatePercentage(billable: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((billable / total) * 10000) / 100;
  }

  extractUniqueUserIds(worklogs: TempoWorklog[]): string[] {
    const userIds = new Set<string>();
    worklogs.forEach(worklog => {
      userIds.add(worklog.author.accountId);
    });
    return Array.from(userIds);
  }

  extractUserName(userId: string, worklogs: TempoWorklog[]): string {
    const worklog = worklogs.find(w => w.author.accountId === userId);
    return worklog?.author.displayName || 'Unknown User';
  }
}