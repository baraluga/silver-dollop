import { TempoService } from '../../services/tempo.service';
import { TempoPlan } from '../../types/tempo.types';

export interface GetTempoPlansParams {
  from: string;
  to: string;
  userId?: string;
}

export async function getTempoPlans(params: GetTempoPlansParams): Promise<TempoPlan[]> {
  const tempoService = new TempoService();

  if (!params?.from || !params?.to) {
    throw new Error('Both from and to dates are required in YYYY-MM-DD format');
  }

  const plans = await tempoService.getPlans(params.from, params.to);

  if (params.userId) {
    return tempoService.filterUserPlans(params.userId, plans);
  }

  return plans;
}


