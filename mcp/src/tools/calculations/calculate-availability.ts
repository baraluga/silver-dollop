import { TempoPlan, TempoWorklog, TeamAvailability, UserAvailability, UserPlannedWork, UserTicketWork } from '../../types/tempo.types';

export interface CalculateAvailabilityParams {
  plans: TempoPlan[];
  worklogs: TempoWorklog[];
  users?: Record<string, string>;
}

export function calculateAvailability(params: CalculateAvailabilityParams): TeamAvailability {
  const { plans, worklogs, users } = params;
  if (!Array.isArray(plans) || !Array.isArray(worklogs)) {
    throw new Error('plans and worklogs must be arrays');
  }

  const userIds = Array.from(new Set([
    ...plans.map(p => p.assignee.id),
    ...worklogs.map(w => w.author.accountId)
  ]));

  const userAvailabilities: UserAvailability[] = userIds.map(userId => {
    const userPlans = plans.filter(p => p.assignee.id === userId);
    const userWorklogs = worklogs.filter(w => w.author.accountId === userId);

    const plannedSeconds = userPlans.reduce((sum, p) => sum + p.totalPlannedSecondsInScope, 0);
    const actualSeconds = userWorklogs.reduce((sum, w) => sum + w.timeSpentSeconds, 0);
    const plannedHours = round2(plannedSeconds / 3600);
    const actualHours = round2(actualSeconds / 3600);
    const availabilityPercentage = plannedHours === 0 ? 0 : round2((actualHours / plannedHours) * 100);

    return {
      userId,
      userName: users?.[userId] || userPlans[0]?.assignee.displayName || userWorklogs[0]?.author.displayName || 'Unknown User',
      plannedHours,
      actualHours,
      availabilityPercentage,
      plannedWork: buildPlannedWork(userPlans),
      actualWork: buildActualWork(userWorklogs)
    };
  });

  const totalPlannedHours = round2(userAvailabilities.reduce((sum, u) => sum + u.plannedHours, 0));
  const totalActualHours = round2(userAvailabilities.reduce((sum, u) => sum + u.actualHours, 0));
  const teamAvailabilityPercentage = totalPlannedHours === 0 ? 0 : round2((totalActualHours / totalPlannedHours) * 100);

  return {
    totalPlannedHours,
    totalActualHours,
    teamAvailabilityPercentage,
    userAvailabilities,
    period: { from: '', to: '' }
  };
}

function buildPlannedWork(plans: TempoPlan[]): UserPlannedWork[] {
  const byIssue: Record<string, number> = {};
  for (const plan of plans) {
    const issueId = plan.planItem?.id || 'unknown';
    byIssue[issueId] = (byIssue[issueId] || 0) + plan.totalPlannedSecondsInScope;
  }
  return Object.entries(byIssue).map(([key, seconds]) => ({
    ticketKey: key,
    ticketSummary: '',
    projectKey: '',
    projectName: '',
    plannedHours: round2(seconds / 3600)
  })).sort((a, b) => b.plannedHours - a.plannedHours);
}

function buildActualWork(worklogs: TempoWorklog[]): UserTicketWork[] {
  const byIssue: Record<string, { total: number; billable: number }> = {};
  for (const w of worklogs) {
    const issueId = (w.issue?.key || w.issue?.id?.toString()) || 'unknown';
    if (!byIssue[issueId]) byIssue[issueId] = { total: 0, billable: 0 };
    byIssue[issueId].total += w.timeSpentSeconds;
    byIssue[issueId].billable += w.billableSeconds;
  }
  return Object.entries(byIssue).map(([key, s]) => ({
    ticketKey: key,
    ticketSummary: '',
    projectKey: '',
    projectName: '',
    hours: round2(s.total / 3600),
    billableHours: round2(s.billable / 3600)
  })).sort((a, b) => b.hours - a.hours);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}


