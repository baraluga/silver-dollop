import { TempoPlan, TempoWorklog, TempoUser } from '../types/tempo.interfaces';
import { nullSafe } from '../util/null-safe';

export interface UserAvailability {
  userId: string;
  userName: string;
  plannedHours: number;
  actualHours: number;
  availabilityPercentage: number;
}

export interface TeamAvailability {
  totalPlannedHours: number;
  totalActualHours: number;
  teamAvailabilityPercentage: number;
  userAvailabilities: UserAvailability[];
}

export class AvailabilityService {
  calculateUserAvailability(userId: string, data: { plans: TempoPlan[]; worklogs: TempoWorklog[] }): UserAvailability {
    const userPlans = this.filterUserPlans(userId, data.plans);
    const userWorklogs = this.filterUserWorklogs(userId, data.worklogs);

    const plannedHours = this.calculatePlannedHours(userPlans);
    const actualHours = this.calculateActualHours(userWorklogs);

    return {
      userId,
      userName: this.extractUserName(userId, data),
      plannedHours,
      actualHours,
      availabilityPercentage: this.calculatePercentage(actualHours, plannedHours)
    };
  }

  calculateTeamAvailability(data: { plans: TempoPlan[]; worklogs: TempoWorklog[] }): TeamAvailability {
    const userIds = this.extractUniqueUserIds(data.plans, data.worklogs);
    const userAvailabilities = this.calculateAllUserAvailabilities(userIds, data);
    const totalPlannedHours = this.sumPlannedHours(userAvailabilities);
    const totalActualHours = this.sumActualHours(userAvailabilities);

    return {
      totalPlannedHours,
      totalActualHours,
      teamAvailabilityPercentage: this.calculatePercentage(totalActualHours, totalPlannedHours),
      userAvailabilities
    };
  }

  private filterUserPlans(userId: string, plans: TempoPlan[]): TempoPlan[] {
    return plans.filter(plan => this.matchesUserId(plan.assignee, userId));
  }

  private filterUserWorklogs(userId: string, worklogs: TempoWorklog[]): TempoWorklog[] {
    return worklogs.filter(worklog => this.matchesUserId(worklog.author, userId));
  }

  private matchesUserId(user: TempoUser | undefined, userId: string): boolean {
    return this.getUserId(user) === userId;
  }

  private calculatePlannedHours(plans: TempoPlan[]): number {
    const totalSeconds = plans.reduce((sum, plan) => sum + plan.totalPlannedSecondsInScope, 0);
    return this.convertSecondsToHours(totalSeconds);
  }

  private calculateActualHours(worklogs: TempoWorklog[]): number {
    const totalSeconds = worklogs.reduce((sum, worklog) => sum + worklog.timeSpentSeconds, 0);
    return this.convertSecondsToHours(totalSeconds);
  }

  private convertSecondsToHours(seconds: number): number {
    return Math.round((seconds / 3600) * 100) / 100;
  }

  private calculatePercentage(actual: number, planned: number): number {
    if (planned === 0) return 0;
    return Math.round((actual / planned) * 100 * 100) / 100;
  }

  private extractUserName(userId: string, data: { plans: TempoPlan[]; worklogs: TempoWorklog[] }): string {
    const userPlan = this.findUserInPlans(userId, data.plans);
    if (userPlan) return userPlan;

    return this.findUserInWorklogsOrDefault(userId, data.worklogs);
  }

  private findUserInWorklogsOrDefault(userId: string, worklogs: TempoWorklog[]): string {
    const userWorklog = worklogs.find(worklog => this.matchesUserId(worklog.author, userId));
    return this.getUserDisplayName(userWorklog);
  }

  private getUserDisplayName(userWorklog: TempoWorklog | undefined): string {
    return nullSafe.string(userWorklog?.author?.displayName, 'Unknown User');
  }

  private findUserInPlans(userId: string, plans: TempoPlan[]): string | undefined {
    const userPlan = plans.find(plan => this.matchesUserId(plan.assignee, userId));
    return this.getDisplayNameFromPlan(userPlan);
  }

  private getDisplayNameFromPlan(userPlan: TempoPlan | undefined): string | undefined {
    return userPlan?.assignee?.displayName;
  }

  private extractUniqueUserIds(plans: TempoPlan[], worklogs: TempoWorklog[]): string[] {
    const userIds = new Set<string>();
    
    plans.forEach(plan => this.addUserIdIfValid(plan.assignee, userIds));
    worklogs.forEach(worklog => this.addUserIdIfValid(worklog.author, userIds));

    return Array.from(userIds);
  }

  private addUserIdIfValid(user: { accountId?: string; id?: string } | undefined, userIds: Set<string>): void {
    const accountId = this.getUserId(user);
    if (accountId) {
      userIds.add(accountId);
    }
  }

  private getUserId(user: { accountId?: string; id?: string } | undefined): string | undefined {
    if (!user) return undefined;
    return user.accountId || user.id;
  }

  private calculateAllUserAvailabilities(userIds: string[], data: { plans: TempoPlan[]; worklogs: TempoWorklog[] }): UserAvailability[] {
    return userIds.map(userId => this.calculateUserAvailability(userId, data));
  }

  private sumPlannedHours(userAvailabilities: UserAvailability[]): number {
    return userAvailabilities.reduce((sum, user) => sum + user.plannedHours, 0);
  }

  private sumActualHours(userAvailabilities: UserAvailability[]): number {
    return userAvailabilities.reduce((sum, user) => sum + user.actualHours, 0);
  }
}

export const availabilityService = new AvailabilityService();