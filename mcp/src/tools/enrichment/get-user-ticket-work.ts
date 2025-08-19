import { TempoWorklog, UserTicketWork } from '../../types/tempo.types';

export interface GetUserTicketWorkParams {
  worklogs: TempoWorklog[];
  issues: Record<string, {
    key: string;
    summary: string;
    project: { key: string; name: string };
  }>;
}

export function getUserTicketWork(params: GetUserTicketWorkParams): Record<string, UserTicketWork[]> {
  const { worklogs, issues } = params;
  const byUser: Record<string, Record<string, { seconds: number; billable: number; meta: { key: string; summary: string; projectKey: string; projectName: string } }>> = {};

  for (const w of worklogs) {
    const userId = w.author.accountId;
    const issueId = w.issue?.id?.toString();
    const issue = issueId ? issues[issueId] : undefined;
    const key = issue?.key || `ISSUE-${issueId}`;
    const summary = issue?.summary || 'Unknown Issue';
    const projectKey = issue?.project.key || 'Unknown';
    const projectName = issue?.project.name || 'Unknown Project';

    if (!byUser[userId]) byUser[userId] = {};
    if (!byUser[userId][key]) byUser[userId][key] = { seconds: 0, billable: 0, meta: { key, summary, projectKey, projectName } };

    byUser[userId][key].seconds += w.timeSpentSeconds;
    byUser[userId][key].billable += w.billableSeconds;
  }

  const result: Record<string, UserTicketWork[]> = {};
  for (const [userId, tickets] of Object.entries(byUser)) {
    result[userId] = Object.values(tickets).map(t => ({
      ticketKey: t.meta.key,
      ticketSummary: t.meta.summary,
      projectKey: t.meta.projectKey,
      projectName: t.meta.projectName,
      hours: round2(t.seconds / 3600),
      billableHours: round2(t.billable / 3600)
    })).sort((a, b) => b.hours - a.hours);
  }

  return result;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}


