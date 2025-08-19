import { TempoWorklog } from '../../types/tempo.types';

export interface AnalyzeProjectDistributionParams {
  worklogs: TempoWorklog[];
  issues?: Record<string, {
    key: string;
    summary: string;
    project: { key: string; name: string };
  }>;
}

export function analyzeProjectDistribution(params: AnalyzeProjectDistributionParams) {
  const { worklogs, issues } = params;
  if (!Array.isArray(worklogs)) {
    throw new Error('worklogs must be an array');
  }

  const stats: Record<string, {
    projectKey: string;
    projectName: string;
    totalSeconds: number;
    billableSeconds: number;
  }> = {};

  for (const w of worklogs) {
    const issueId = w.issue?.id?.toString();
    const issue = issueId ? issues?.[issueId] : undefined;
    const projectKey = issue?.project.key || 'Unknown';
    const projectName = issue?.project.name || 'Unknown Project';
    if (!stats[projectKey]) {
      stats[projectKey] = { projectKey, projectName, totalSeconds: 0, billableSeconds: 0 };
    }
    stats[projectKey].totalSeconds += w.timeSpentSeconds;
    stats[projectKey].billableSeconds += w.billableSeconds;
  }

  const distribution = Object.values(stats).map(s => ({
    projectKey: s.projectKey,
    projectName: s.projectName,
    hours: round2(s.totalSeconds / 3600),
    billableHours: round2(s.billableSeconds / 3600),
  })).sort((a, b) => b.hours - a.hours);

  return { distribution };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}


