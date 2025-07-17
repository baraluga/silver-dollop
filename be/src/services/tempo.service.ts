import axios from "axios";
import { TempoPlan, TempoWorklog } from "../types/tempo.interfaces";
import { nullSafe } from "../util/null-safe";

export class TempoService {
  private readonly baseUrl = "https://api.tempo.io/4";
  private readonly token = process.env.TEMPO_API_TOKEN;

  async getPlans(from: string, to: string): Promise<TempoPlan[]> {
    const response = await this.makeRequest("/plans", { from, to });
    return nullSafe.array(response.data.results) as TempoPlan[];
  }

  async getWorklogs(from: string, to: string): Promise<TempoWorklog[]> {
    const response = await this.makeRequest("/worklogs", { from, to });
    return nullSafe.array(response.data.results) as TempoWorklog[];
  }

  private async makeRequest(endpoint: string, params: Record<string, string>) {
    return axios.get(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      params,
    });
  }

  async getTeamData(): Promise<unknown> {
    const response = await axios.get(`${this.baseUrl}/teams`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    return response.data;
  }
}

export const tempoService = new TempoService();
