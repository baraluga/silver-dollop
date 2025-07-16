import axios from 'axios';
import { TempoPlan, TempoWorklog } from '../types/tempo.interfaces';

export class TempoService {
  private readonly baseUrl = 'https://api.tempo.io/4';
  private readonly token = process.env.TEMPO_API_TOKEN;

  async getPlans(from: string, to: string): Promise<TempoPlan[]> {
    try {
      const response = await this.makeRequest('/plans', { from, to });
      return this.extractResults(response, 'plans') as TempoPlan[];
    } catch (error) {
      console.error('Error fetching Tempo plans:', error);
      return [];
    }
  }

  async getWorklogs(from: string, to: string): Promise<TempoWorklog[]> {
    try {
      const response = await this.makeRequest('/worklogs', { from, to });
      return this.extractResults(response, 'worklogs') as TempoWorklog[];
    } catch (error) {
      console.error('Error fetching Tempo worklogs:', error);
      return [];
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, string>) {
    return axios.get(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      params
    });
  }

  private extractResults(response: { data: { results?: unknown[] } }, type: string): unknown[] {
    const results = response.data.results || [];
    console.log(`Tempo ${type} API returned ${results.length} items`);
    console.log(`First item structure:`, results[0] ? JSON.stringify(results[0], null, 2) : 'No items');
    return results;
  }

  async getTeamData(): Promise<unknown> {
    const response = await axios.get(`${this.baseUrl}/teams`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    return response.data;
  }
}

export const tempoService = new TempoService();