import { TempoWorklog, TeamBillability, UserBillability } from '../../types/tempo.types';

export interface CalculateBillabilityParams {
  worklogs: TempoWorklog[];
  users?: Record<string, string>;
}

export function calculateBillability(params: CalculateBillabilityParams): TeamBillability {
  const { worklogs, users } = params;
  if (!Array.isArray(worklogs)) {
    throw new Error('worklogs must be an array');
  }

  const userIds = Array.from(new Set(worklogs.map(w => w.author.accountId)));

  const userBillabilities: UserBillability[] = userIds.map(userId => {
    const userWorklogs = worklogs.filter(w => w.author.accountId === userId);
    const totalSeconds = userWorklogs.reduce((sum, w) => sum + w.timeSpentSeconds, 0);
    const billableSeconds = userWorklogs.reduce((sum, w) => sum + w.billableSeconds, 0);
    const totalHours = round2(totalSeconds / 3600);
    const billableHours = round2(billableSeconds / 3600);
    const nonBillableHours = round2(totalHours - billableHours);
    const billabilityPercentage = totalHours === 0 ? 0 : round2((billableHours / totalHours) * 100);

    return {
      userId,
      userName: users?.[userId] || userWorklogs[0]?.author.displayName || 'Unknown User',
      totalHours,
      billableHours,
      nonBillableHours,
      billabilityPercentage,
      ticketWork: []
    };
  });

  const totalHours = round2(userBillabilities.reduce((sum, u) => sum + u.totalHours, 0));
  const billableHours = round2(userBillabilities.reduce((sum, u) => sum + u.billableHours, 0));
  const nonBillableHours = round2(totalHours - billableHours);
  const teamBillabilityPercentage = totalHours === 0 ? 0 : round2((billableHours / totalHours) * 100);

  return {
    totalHours,
    billableHours,
    nonBillableHours,
    teamBillabilityPercentage,
    userBillabilities,
    period: { from: '', to: '' }
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}


