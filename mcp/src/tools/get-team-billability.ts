import { TempoService } from '../services/tempo.service';
import { JiraService } from '../services/jira.service';
import { UserBillability, TeamBillability } from '../types/tempo.types';

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

  const userIds = tempoService.extractUniqueUserIds(filteredWorklogs);
  const userDirectory = await jiraService.getMultipleUsers(userIds);

  const userBillabilities: UserBillability[] = userIds.map(userId => {
    const userWorklogs = tempoService.filterUserWorklogs(userId, filteredWorklogs);
    const totalHours = tempoService.calculateTotalHours(userWorklogs);
    const billableHours = tempoService.calculateBillableHours(userWorklogs);
    const nonBillableHours = totalHours - billableHours;

    return {
      userId,
      userName: userDirectory[userId] || 'Unknown User',
      totalHours: Math.round(totalHours * 100) / 100,
      billableHours: Math.round(billableHours * 100) / 100,
      nonBillableHours: Math.round(nonBillableHours * 100) / 100,
      billabilityPercentage: tempoService.calculatePercentage(billableHours, totalHours)
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

