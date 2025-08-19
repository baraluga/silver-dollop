import { TempoService } from '../services/tempo.service';
import { JiraService } from '../services/jira.service';
import { UserAvailability, TeamAvailability, UserPlannedWork, UserTicketWork } from '../types/tempo.types';

interface AvailabilityParams {
  from: string;
  to: string;
  userId?: string;
}

export async function getTeamAvailability(params: AvailabilityParams): Promise<TeamAvailability> {
  const tempoService = new TempoService();
  const jiraService = new JiraService();

  const period = {
    from: params.from,
    to: params.to
  };

  const [plans, worklogs] = await Promise.all([
    tempoService.getPlans(period.from, period.to),
    tempoService.getWorklogs(period.from, period.to)
  ]);

  let filteredPlans = plans;
  let filteredWorklogs = worklogs;
  
  if (params.userId) {
    filteredPlans = tempoService.filterUserPlans(params.userId, plans);
    filteredWorklogs = tempoService.filterUserWorklogs(params.userId, worklogs);
  }

  const userIds = tempoService.extractUniqueUserIdsFromPlansAndWorklogs(filteredPlans, filteredWorklogs);
  
  // Get all unique issue IDs from both plans and worklogs
  const planIssueIds = extractIssueIdsFromPlans(filteredPlans);
  const worklogIssueIds = extractIssueIdsFromWorklogs(filteredWorklogs);
  const allIssueIds = [...new Set([...planIssueIds, ...worklogIssueIds])];
  
  const [userDirectory, issueDetails] = await Promise.all([
    jiraService.getMultipleUsers(userIds),
    jiraService.getMultipleIssues(allIssueIds)
  ]);

  const userAvailabilities: UserAvailability[] = userIds.map(userId => {
    const userPlans = tempoService.filterUserPlans(userId, filteredPlans);
    const userWorklogs = tempoService.filterUserWorklogs(userId, filteredWorklogs);
    
    const plannedHours = tempoService.calculatePlannedHours(userPlans);
    const actualHours = tempoService.calculateTotalHours(userWorklogs);
    const availabilityPercentage = tempoService.calculatePercentage(actualHours, plannedHours);

    // Build planned and actual work breakdowns
    const plannedWork = buildUserPlannedWork(userPlans, issueDetails);
    const actualWork = buildUserActualWork(userWorklogs, issueDetails);

    return {
      userId,
      userName: userDirectory[userId] || tempoService.extractUserNameFromPlansOrWorklogs(userId, userPlans, userWorklogs),
      plannedHours: Math.round(plannedHours * 100) / 100,
      actualHours: Math.round(actualHours * 100) / 100,
      availabilityPercentage,
      plannedWork,
      actualWork
    };
  });

  const totalPlannedHours = userAvailabilities.reduce((sum, user) => sum + user.plannedHours, 0);
  const totalActualHours = userAvailabilities.reduce((sum, user) => sum + user.actualHours, 0);

  return {
    totalPlannedHours: Math.round(totalPlannedHours * 100) / 100,
    totalActualHours: Math.round(totalActualHours * 100) / 100,
    teamAvailabilityPercentage: tempoService.calculatePercentage(totalActualHours, totalPlannedHours),
    userAvailabilities,
    period
  };
}

function extractIssueIdsFromPlans(plans: any[]): string[] {
  const issueIds = new Set<string>();
  plans.forEach(plan => {
    if (plan.planItem?.id) {
      issueIds.add(plan.planItem.id.toString());
    }
  });
  return Array.from(issueIds);
}

function extractIssueIdsFromWorklogs(worklogs: any[]): string[] {
  const issueIds = new Set<string>();
  worklogs.forEach(worklog => {
    if (worklog.issue?.id) {
      issueIds.add(worklog.issue.id.toString());
    }
  });
  return Array.from(issueIds);
}

function buildUserPlannedWork(
  userPlans: any[], 
  issueDetails: Record<string, {
    key: string;
    summary: string;
    project: { key: string; name: string; };
  }>
): UserPlannedWork[] {
  const plannedStats: Record<string, {
    ticketKey: string;
    ticketSummary: string;
    projectKey: string;
    projectName: string;
    totalSeconds: number;
  }> = {};

  userPlans.forEach(plan => {
    const issueId = plan.planItem?.id?.toString();
    const issueData = issueId ? issueDetails[issueId] : null;
    
    const ticketKey = issueData?.key || `ISSUE-${issueId}`;
    const ticketSummary = issueData?.summary || 'Unknown Issue';
    const projectKey = issueData?.project.key || 'Unknown';
    const projectName = issueData?.project.name || 'Unknown Project';

    if (!plannedStats[ticketKey]) {
      plannedStats[ticketKey] = {
        ticketKey,
        ticketSummary,
        projectKey,
        projectName,
        totalSeconds: 0
      };
    }

    plannedStats[ticketKey].totalSeconds += plan.totalPlannedSecondsInScope;
  });

  return Object.values(plannedStats).map(planned => ({
    ticketKey: planned.ticketKey,
    ticketSummary: planned.ticketSummary,
    projectKey: planned.projectKey,
    projectName: planned.projectName,
    plannedHours: Math.round(planned.totalSeconds / 3600 * 100) / 100
  })).sort((a, b) => b.plannedHours - a.plannedHours);
}

function buildUserActualWork(
  userWorklogs: any[], 
  issueDetails: Record<string, {
    key: string;
    summary: string;
    project: { key: string; name: string; };
  }>
): UserTicketWork[] {
  const actualStats: Record<string, {
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

    if (!actualStats[ticketKey]) {
      actualStats[ticketKey] = {
        ticketKey,
        ticketSummary,
        projectKey,
        projectName,
        totalSeconds: 0,
        billableSeconds: 0
      };
    }

    actualStats[ticketKey].totalSeconds += worklog.timeSpentSeconds;
    actualStats[ticketKey].billableSeconds += worklog.billableSeconds;
  });

  return Object.values(actualStats).map(actual => ({
    ticketKey: actual.ticketKey,
    ticketSummary: actual.ticketSummary,
    projectKey: actual.projectKey,
    projectName: actual.projectName,
    hours: Math.round(actual.totalSeconds / 3600 * 100) / 100,
    billableHours: Math.round(actual.billableSeconds / 3600 * 100) / 100
  })).sort((a, b) => b.hours - a.hours);
}