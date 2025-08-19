import { TempoService } from '../../services/tempo.service';
import { TempoWorklog } from '../../types/tempo.types';

export interface GetTempoWorklogsParams {
  from: string;
  to: string;
  userId?: string;
}

export async function getTempoWorklogs(params: GetTempoWorklogsParams): Promise<TempoWorklog[]> {
  const tempoService = new TempoService();

  if (!params?.from || !params?.to) {
    throw new Error('Both from and to dates are required in YYYY-MM-DD format');
  }

  const worklogs = await tempoService.getWorklogs(params.from, params.to);

  if (params.userId) {
    return tempoService.filterUserWorklogs(params.userId, worklogs);
  }

  return worklogs;
}


