import { TempoService } from '../services/tempo.service';
import { JiraService } from '../services/jira.service';
import { ProjectInsights, ProjectBreakdownItem, TicketBreakdown, TempoWorklog } from '../types/tempo.types';

interface ProjectInsightsParams {
  from: string;
  to: string;
}

interface TicketStats {
  key: string;
  summary: string;
  totalSeconds: number;
  billableSeconds: number;
}

interface ProjectStats {
  projectKey: string;
  projectName: string;
  totalSeconds: number;
  billableSeconds: number;
  tickets: Record<string, TicketStats>;
}

export async function getProjectInsights(params: ProjectInsightsParams): Promise<ProjectInsights> {
  const tempoService = new TempoService();
  const jiraService = new JiraService();

  const period = {
    from: params.from,
    to: params.to
  };

  const worklogs = await tempoService.getWorklogs(period.from, period.to);
  
  // Get unique issue IDs from worklogs
  const issueIds = extractUniqueIssueIds(worklogs);
  
  // Fetch issue details from Jira
  const issueDetails = await jiraService.getMultipleIssues(issueIds);
  
  // Calculate project stats with real project data
  const projectStats = calculateProjectStatsWithIssueData(worklogs, issueDetails);
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

function extractUniqueIssueIds(worklogs: TempoWorklog[]): string[] {
  const issueIds = new Set<string>();
  worklogs.forEach(worklog => {
    if (worklog.issue?.id) {
      issueIds.add(worklog.issue.id.toString());
    }
  });
  return Array.from(issueIds);
}

function calculateProjectStatsWithIssueData(
  worklogs: TempoWorklog[], 
  issueDetails: Record<string, {
    key: string;
    summary: string;
    project: {
      key: string;
      name: string;
    };
  }>
): Record<string, ProjectStats> {
  const stats: Record<string, ProjectStats> = {};
  
  worklogs.forEach((worklog) => {
    const issueId = worklog.issue?.id?.toString();
    const issueData = issueId ? issueDetails[issueId] : null;
    
    const projectKey = issueData?.project.key || 'Unknown';
    const projectName = issueData?.project.name || 'Unknown Project';
    const ticketKey = issueData?.key || `ISSUE-${issueId}`;
    const ticketSummary = issueData?.summary || 'Unknown Issue';
    
    // Initialize project if not exists
    if (!stats[projectKey]) {
      stats[projectKey] = {
        projectKey,
        projectName,
        totalSeconds: 0,
        billableSeconds: 0,
        tickets: {}
      };
    }
    
    // Initialize ticket if not exists
    if (!stats[projectKey].tickets[ticketKey]) {
      stats[projectKey].tickets[ticketKey] = {
        key: ticketKey,
        summary: ticketSummary,
        totalSeconds: 0,
        billableSeconds: 0
      };
    }
    
    // Add time to both project and ticket totals
    stats[projectKey].totalSeconds += worklog.timeSpentSeconds;
    stats[projectKey].billableSeconds += worklog.billableSeconds;
    
    stats[projectKey].tickets[ticketKey].totalSeconds += worklog.timeSpentSeconds;
    stats[projectKey].tickets[ticketKey].billableSeconds += worklog.billableSeconds;
  });
  
  return stats;
}


function calculateTotalHours(worklogs: TempoWorklog[]): number {
  return worklogs.reduce((total, worklog) => total + worklog.timeSpentSeconds, 0) / 3600;
}

function buildProjectBreakdown(
  projectStats: Record<string, ProjectStats>, 
  totalHours: number
): ProjectBreakdownItem[] {
  return Object.values(projectStats).map((stats) => {
    const projectHours = stats.totalSeconds / 3600;
    
    // Build ticket breakdown for this project
    const tickets: TicketBreakdown[] = Object.values(stats.tickets).map((ticket) => ({
      key: ticket.key,
      summary: ticket.summary,
      hours: Math.round(ticket.totalSeconds / 3600 * 100) / 100,
      billableHours: Math.round(ticket.billableSeconds / 3600 * 100) / 100,
      percentageOfProject: projectHours > 0 ? Math.round((ticket.totalSeconds / 3600) / projectHours * 10000) / 100 : 0,
    })).sort((a, b) => b.hours - a.hours); // Sort tickets by hours (descending)
    
    return {
      projectKey: stats.projectKey,
      projectName: stats.projectName,
      totalHours: Math.round(projectHours * 100) / 100,
      billableHours: Math.round(stats.billableSeconds / 3600 * 100) / 100,
      percentageOfTotal: totalHours > 0 ? Math.round(projectHours / totalHours * 10000) / 100 : 0,
      tickets
    };
  });
}

function getTopProjects(breakdown: ProjectBreakdownItem[]): ProjectBreakdownItem[] {
  return breakdown
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 5);
}