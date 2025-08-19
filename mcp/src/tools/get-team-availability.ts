import { TempoService } from '../services/tempo.service';
import { JiraService } from '../services/jira.service';
import { UserAvailability, TeamAvailability } from '../types/tempo.types';

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
  const userDirectory = await jiraService.getMultipleUsers(userIds);

  const userAvailabilities: UserAvailability[] = userIds.map(userId => {
    const userPlans = tempoService.filterUserPlans(userId, filteredPlans);
    const userWorklogs = tempoService.filterUserWorklogs(userId, filteredWorklogs);
    
    const plannedHours = tempoService.calculatePlannedHours(userPlans);
    const actualHours = tempoService.calculateTotalHours(userWorklogs);
    const availabilityPercentage = tempoService.calculatePercentage(actualHours, plannedHours);

    return {
      userId,
      userName: userDirectory[userId] || tempoService.extractUserNameFromPlansOrWorklogs(userId, userPlans, userWorklogs),
      plannedHours: Math.round(plannedHours * 100) / 100,
      actualHours: Math.round(actualHours * 100) / 100,
      availabilityPercentage
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