import axios from 'axios';
import { TempoPlan, TempoWorklog } from '../types/tempo.interfaces';

export class TempoService {
  private readonly baseUrl = 'https://api.tempo.io/4';
  private readonly token = process.env.TEMPO_API_TOKEN;

  async getPlans(from: string, to: string): Promise<TempoPlan[]> {
    const response = await axios.get(`${this.baseUrl}/plans`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      params: { from, to }
    });

    return response.data.results;
  }

  async getWorklogs(from: string, to: string): Promise<TempoWorklog[]> {
    const response = await axios.get(`${this.baseUrl}/worklogs`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      params: { from, to }
    });

    return response.data.results;
  }
}