import { TempoService } from '../services/tempo.service';
import { ProjectInsights, ProjectBreakdownItem, TempoWorklog } from '../types/tempo.types';

interface ProjectInsightsParams {
  from: string;
  to: string;
}

interface ProjectStats {
  projectKey: string;
  projectName: string;
  totalSeconds: number;
  billableSeconds: number;
}

export async function getProjectInsights(params: ProjectInsightsParams): Promise<ProjectInsights> {
  const tempoService = new TempoService();

  const period = {
    from: params.from,
    to: params.to
  };

  const worklogs = await tempoService.getWorklogs(period.from, period.to);
  
  const projectStats = calculateProjectStats(worklogs);
  const totalHours = calculateTotalHours(worklogs);
  
  const projectBreakdown = buildProjectBreakdown(projectStats, totalHours);
  const topProjects = getTopProjects(projectBreakdown);
  
  return {
    totalProjects: Object.keys(projectStats).length,
    projectBreakdown,
    topProjects,
    period
  };
}

function calculateProjectStats(worklogs: TempoWorklog[]): Record<string, ProjectStats> {
  const stats: Record<string, ProjectStats> = {};
  
  worklogs.forEach((worklog) => {
    const key = getProjectIdentifier(worklog);
    
    if (!stats[key]) {
      stats[key] = createProjectStats(worklog);
    }
    
    updateProjectStats(stats[key], worklog);
  });
  
  return stats;
}

function createProjectStats(worklog: TempoWorklog): ProjectStats {
  return {
    projectKey: getProjectKey(worklog),
    projectName: getProjectName(worklog),
    totalSeconds: 0,
    billableSeconds: 0,
  };
}

function updateProjectStats(stats: ProjectStats, worklog: TempoWorklog): void {
  stats.totalSeconds += worklog.timeSpentSeconds;
  stats.billableSeconds += worklog.billableSeconds;
}

function getProjectIdentifier(worklog: TempoWorklog): string {
  return getProjectKey(worklog) || 'unknown';
}

function getProjectKey(worklog: TempoWorklog): string {
  // Extract project key from issue key (e.g., "PROJ-123" -> "PROJ")
  if (worklog.issue?.key) {
    const match = worklog.issue.key.match(/^([A-Z]+)-/);
    return match ? match[1] : worklog.issue.key;
  }
  return 'Unknown';
}

function getProjectName(worklog: TempoWorklog): string {
  // For now, use project key as name since Tempo worklog API doesn't include project name
  // In a real implementation, you might cache project details from Jira API
  return getProjectKey(worklog) + ' Project';
}

function calculateTotalHours(worklogs: TempoWorklog[]): number {
  return worklogs.reduce((total, worklog) => total + worklog.timeSpentSeconds, 0) / 3600;
}

function buildProjectBreakdown(
  projectStats: Record<string, ProjectStats>, 
  totalHours: number
): ProjectBreakdownItem[] {
  return Object.values(projectStats).map((stats) => ({
    projectKey: stats.projectKey,
    projectName: stats.projectName,
    totalHours: Math.round(stats.totalSeconds / 3600 * 100) / 100,
    billableHours: Math.round(stats.billableSeconds / 3600 * 100) / 100,
    percentageOfTotal: totalHours > 0 ? Math.round((stats.totalSeconds / 3600) / totalHours * 10000) / 100 : 0,
  }));
}

function getTopProjects(breakdown: ProjectBreakdownItem[]): ProjectBreakdownItem[] {
  return breakdown
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 5);
}