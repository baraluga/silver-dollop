import { TempoPlan, TempoUser, TempoWorklog } from "../types/tempo.interfaces";
import { TempoCommon } from "../util/tempo-common";

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
  calculateUserAvailability(
    userId: string,
    data: { plans: TempoPlan[]; worklogs: TempoWorklog[] },
  ): UserAvailability {
    const userPlans = this.filterUserPlans(userId, data.plans);
    const userWorklogs = this.filterUserWorklogs(userId, data.worklogs);

    const plannedHours = this.calculatePlannedHours(userPlans);
    const actualHours = this.calculateActualHours(userWorklogs);

    return {
      userId,
      userName: this.extractUserName(userId, data),
      plannedHours,
      actualHours,
      availabilityPercentage: this.calculatePercentage(
        actualHours,
        plannedHours,
      ),
    };
  }

  calculateTeamAvailability(data: {
    plans: TempoPlan[];
    worklogs: TempoWorklog[];
  }): TeamAvailability {
    const userAvailabilities = this.calculateAllUserAvailabilities(
      this.extractUniqueUserIds(data.plans, data.worklogs),
      data,
    );
    const totalPlannedHours = this.sumPlannedHours(userAvailabilities);
    const totalActualHours = this.sumActualHours(userAvailabilities);

    return {
      totalPlannedHours,
      totalActualHours,
      teamAvailabilityPercentage: this.calculatePercentage(
        totalActualHours,
        totalPlannedHours,
      ),
      userAvailabilities,
    };
  }

  private filterUserPlans(userId: string, plans: TempoPlan[]): TempoPlan[] {
    return plans.filter((plan) => this.matchesUserId(plan.assignee, userId));
  }

  private filterUserWorklogs(
    userId: string,
    worklogs: TempoWorklog[],
  ): TempoWorklog[] {
    return TempoCommon.filterUserWorklogs(userId, worklogs);
  }

  private matchesUserId(user: TempoUser | undefined, userId: string): boolean {
    return TempoCommon.matchesUserId(user, userId);
  }

  private calculatePlannedHours(plans: TempoPlan[]): number {
    const totalSeconds = plans.reduce(
      (sum, plan) => sum + plan.totalPlannedSecondsInScope,
      0,
    );
    return this.convertSecondsToHours(totalSeconds);
  }

  private calculateActualHours(worklogs: TempoWorklog[]): number {
    const totalSeconds = worklogs.reduce(
      (sum, worklog) => sum + worklog.timeSpentSeconds,
      0,
    );
    return this.convertSecondsToHours(totalSeconds);
  }

  private convertSecondsToHours(seconds: number): number {
    return TempoCommon.convertSecondsToHours(seconds);
  }

  private calculatePercentage(actual: number, planned: number): number {
    return TempoCommon.calculatePercentage(actual, planned);
  }

  private extractUserName(
    userId: string,
    data: { plans: TempoPlan[]; worklogs: TempoWorklog[] },
  ): string {
    const userPlan = this.findUserInPlans(userId, data.plans);
    if (userPlan) return userPlan;

    return this.findUserInWorklogsOrDefault(userId, data.worklogs);
  }

  private findUserInWorklogsOrDefault(
    userId: string,
    worklogs: TempoWorklog[],
  ): string {
    return TempoCommon.extractUserName(userId, worklogs);
  }

  private findUserInPlans(
    userId: string,
    plans: TempoPlan[],
  ): string | undefined {
    const userPlan = plans.find((plan) =>
      this.matchesUserId(plan.assignee, userId),
    );
    return this.getDisplayNameFromPlan(userPlan);
  }

  private getDisplayNameFromPlan(
    userPlan: TempoPlan | undefined,
  ): string | undefined {
    return userPlan?.assignee?.displayName;
  }

  private extractUniqueUserIds(
    plans: TempoPlan[],
    worklogs: TempoWorklog[],
  ): string[] {
    return TempoCommon.extractUniqueUserIdsFromPlansAndWorklogs(
      plans,
      worklogs,
    );
  }

  private calculateAllUserAvailabilities(
    userIds: string[],
    data: { plans: TempoPlan[]; worklogs: TempoWorklog[] },
  ): UserAvailability[] {
    return userIds.map((userId) =>
      this.calculateUserAvailability(userId, data),
    );
  }

  private sumPlannedHours(userAvailabilities: UserAvailability[]): number {
    return userAvailabilities.reduce((sum, user) => sum + user.plannedHours, 0);
  }

  private sumActualHours(userAvailabilities: UserAvailability[]): number {
    return userAvailabilities.reduce((sum, user) => sum + user.actualHours, 0);
  }
}

export const availabilityService = new AvailabilityService();
