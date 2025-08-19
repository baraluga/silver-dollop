import { TempoWorklog } from '../../types/tempo.types';

export interface GetProjectTicketBreakdownParams {
  worklogs: any[]; // Accept any to tolerate raw Tempo payloads
  issues: Record<string, {
    key: string;
    summary: string;
    project: { key: string; name: string };
  }>;
}

export function getProjectTicketBreakdown(params: GetProjectTicketBreakdownParams) {
  const { worklogs, issues } = params;
  const projects: Record<string, {
    projectKey: string;
    projectName: string;
    tickets: Record<string, { key: string; summary: string; totalSeconds: number; billableSeconds: number }>;
  }> = {};

  for (const w of worklogs as TempoWorklog[]) {
    const issueId = w.issue?.id?.toString();
    const issue = issueId ? issues[issueId] : undefined;
    const projectKey = issue?.project.key || 'Unknown';
    const projectName = issue?.project.name || 'Unknown Project';
    const key = issue?.key || `ISSUE-${issueId}`;
    const summary = issue?.summary || 'Unknown Issue';

    if (!projects[projectKey]) {
      projects[projectKey] = { projectKey, projectName, tickets: {} };
    }
    if (!projects[projectKey].tickets[key]) {
      projects[projectKey].tickets[key] = { key, summary, totalSeconds: 0, billableSeconds: 0 };
    }

    projects[projectKey].tickets[key].totalSeconds += w.timeSpentSeconds;
    projects[projectKey].tickets[key].billableSeconds += w.billableSeconds;
  }

  return Object.values(projects).map(p => ({
    projectKey: p.projectKey,
    projectName: p.projectName,
    tickets: Object.values(p.tickets).map(t => ({
      key: t.key,
      summary: t.summary,
      hours: round2(t.totalSeconds / 3600),
      billableHours: round2(t.billableSeconds / 3600)
    })).sort((a, b) => b.hours - a.hours)
  }));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}


