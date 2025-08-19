import { TempoService } from '../services/tempo.service';
import { JiraService } from '../services/jira.service';
import { UserBillability, TeamBillability, UserTicketWork } from '../types/tempo.types';

interface BillabilityParams {
  from?: string;
  to?: string;
  userId?: string;
}

export async function getTeamBillability(params: BillabilityParams): Promise<TeamBillability> {
  const tempoService = new TempoService();
  const jiraService = new JiraService();

  if (!params.from || !params.to) {
    throw new Error('Both from and to dates are required in YYYY-MM-DD format');
  }

  const period = {
    from: params.from,
    to: params.to
  };

  const worklogs = await tempoService.getWorklogs(period.from, period.to);

  let filteredWorklogs = worklogs;
  if (params.userId) {
    filteredWorklogs = tempoService.filterUserWorklogs(params.userId, worklogs);
  }

  // Get issue details for ticket context
  const issueIds = extractUniqueIssueIds(filteredWorklogs);
  const [userDirectory, issueDetails] = await Promise.all([
    jiraService.getMultipleUsers(tempoService.extractUniqueUserIds(filteredWorklogs)),
    jiraService.getMultipleIssues(issueIds)
  ]);

  const userBillabilities: UserBillability[] = tempoService.extractUniqueUserIds(filteredWorklogs).map(userId => {
    const userWorklogs = tempoService.filterUserWorklogs(userId, filteredWorklogs);
    const totalHours = tempoService.calculateTotalHours(userWorklogs);
    const billableHours = tempoService.calculateBillableHours(userWorklogs);
    const nonBillableHours = totalHours - billableHours;

    // Build ticket work breakdown for this user
    const ticketWork = buildUserTicketWork(userWorklogs, issueDetails);

    return {
      userId,
      userName: userDirectory[userId] || 'Unknown User',
      totalHours: Math.round(totalHours * 100) / 100,
      billableHours: Math.round(billableHours * 100) / 100,
      nonBillableHours: Math.round(nonBillableHours * 100) / 100,
      billabilityPercentage: tempoService.calculatePercentage(billableHours, totalHours),
      ticketWork
    };
  });

  const totalHours = userBillabilities.reduce((sum, user) => sum + user.totalHours, 0);
  const totalBillableHours = userBillabilities.reduce((sum, user) => sum + user.billableHours, 0);
  const totalNonBillableHours = totalHours - totalBillableHours;

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    billableHours: Math.round(totalBillableHours * 100) / 100,
    nonBillableHours: Math.round(totalNonBillableHours * 100) / 100,
    teamBillabilityPercentage: tempoService.calculatePercentage(totalBillableHours, totalHours),
    userBillabilities,
    period
  };
}

function extractUniqueIssueIds(worklogs: any[]): string[] {
  const issueIds = new Set<string>();
  worklogs.forEach(worklog => {
    if (worklog.issue?.id) {
      issueIds.add(worklog.issue.id.toString());
    }
  });
  return Array.from(issueIds);
}

function buildUserTicketWork(
  userWorklogs: any[], 
  issueDetails: Record<string, {
    key: string;
    summary: string;
    project: { key: string; name: string; };
  }>
): UserTicketWork[] {
  const ticketStats: Record<string, {
    ticketKey: string;
    ticketSummary: string;
    projectKey: string;
    projectName: string;
    totalSeconds: number;
    billableSeconds: number;
  }> = {};

  userWorklogs.forEach(worklog => {
    const issueId = worklog.issue?.id?.toString();
    const issueData = issueId ? issueDetails[issueId] : null;
    
    const ticketKey = issueData?.key || `ISSUE-${issueId}`;
    const ticketSummary = issueData?.summary || 'Unknown Issue';
    const projectKey = issueData?.project.key || 'Unknown';
    const projectName = issueData?.project.name || 'Unknown Project';

    if (!ticketStats[ticketKey]) {
      ticketStats[ticketKey] = {
        ticketKey,
        ticketSummary,
        projectKey,
        projectName,
        totalSeconds: 0,
        billableSeconds: 0
      };
    }

    ticketStats[ticketKey].totalSeconds += worklog.timeSpentSeconds;
    ticketStats[ticketKey].billableSeconds += worklog.billableSeconds;
  });

  return Object.values(ticketStats).map(ticket => ({
    ticketKey: ticket.ticketKey,
    ticketSummary: ticket.ticketSummary,
    projectKey: ticket.projectKey,
    projectName: ticket.projectName,
    hours: Math.round(ticket.totalSeconds / 3600 * 100) / 100,
    billableHours: Math.round(ticket.billableSeconds / 3600 * 100) / 100
  })).sort((a, b) => b.hours - a.hours);
}

