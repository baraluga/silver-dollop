import { TempoWorklog } from '../types/tempo.interfaces';
import { getBillabilityConfig } from '../config/billability.config';

export interface UserBillability {
  userId: string;
  userName: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  billabilityPercentage: number;
}

export interface TeamBillability {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  teamBillabilityPercentage: number;
  userBillabilities: UserBillability[];
}

export interface BillabilityTrend {
  actualBillabilityPercentage: number;
  idealBillabilityPercentage: number;
  isOnTarget: boolean;
  variance: number;
}

export class BillabilityService {
  calculateUserBillability(userId: string, worklogs: TempoWorklog[]): UserBillability {
    const userWorklogs = this.filterUserWorklogs(userId, worklogs);
    
    const totalHours = this.calculateTotalHours(userWorklogs);
    const billableHours = this.calculateBillableHours(userWorklogs);
    const nonBillableHours = this.calculateNonBillableHours(totalHours, billableHours);

    return {
      userId,
      userName: this.extractUserName(userId, worklogs),
      totalHours,
      billableHours,
      nonBillableHours,
      billabilityPercentage: this.calculatePercentage(billableHours, totalHours)
    };
  }

  calculateTeamBillability(worklogs: TempoWorklog[]): TeamBillability {
    const userIds = this.extractUniqueUserIds(worklogs);
    const userBillabilities = this.calculateAllUserBillabilities(userIds, worklogs);

    const totalHours = this.sumTotalHours(userBillabilities);
    const billableHours = this.sumBillableHours(userBillabilities);
    const nonBillableHours = this.calculateNonBillableHours(totalHours, billableHours);

    return {
      totalHours,
      billableHours,
      nonBillableHours,
      teamBillabilityPercentage: this.calculatePercentage(billableHours, totalHours),
      userBillabilities
    };
  }

  analyzeBillabilityTrend(worklogs: TempoWorklog[]): BillabilityTrend {
    const teamBillability = this.calculateTeamBillability(worklogs);
    const idealRatio = this.getIdealBillabilityRatio();

    const actualPercentage = teamBillability.teamBillabilityPercentage;
    const idealPercentage = idealRatio.idealRatioPercentage;
    const variance = this.calculateVariance(actualPercentage, idealPercentage);

    return {
      actualBillabilityPercentage: actualPercentage,
      idealBillabilityPercentage: idealPercentage,
      isOnTarget: this.isOnTarget(actualPercentage, idealPercentage),
      variance
    };
  }

  private filterUserWorklogs(userId: string, worklogs: TempoWorklog[]): TempoWorklog[] {
    return worklogs.filter(worklog => worklog.user?.accountId === userId);
  }

  private calculateTotalHours(worklogs: TempoWorklog[]): number {
    const totalSeconds = worklogs.reduce((sum, worklog) => sum + worklog.timeSpentSeconds, 0);
    return this.convertSecondsToHours(totalSeconds);
  }

  private calculateBillableHours(worklogs: TempoWorklog[]): number {
    const billableSeconds = worklogs.reduce((sum, worklog) => sum + worklog.billableSeconds, 0);
    return this.convertSecondsToHours(billableSeconds);
  }

  private calculateNonBillableHours(totalHours: number, billableHours: number): number {
    return Math.round((totalHours - billableHours) * 100) / 100;
  }

  private convertSecondsToHours(seconds: number): number {
    return Math.round((seconds / 3600) * 100) / 100;
  }

  private calculatePercentage(billable: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((billable / total) * 100 * 100) / 100;
  }

  private extractUserName(userId: string, worklogs: TempoWorklog[]): string {
    const userWorklog = worklogs.find(worklog => worklog.user?.accountId === userId);
    return userWorklog?.user?.displayName ?? 'Unknown User';
  }

  private extractUniqueUserIds(worklogs: TempoWorklog[]): string[] {
    const userIds = new Set<string>();
    worklogs.forEach(worklog => this.addUserIdIfValid(worklog.user, userIds));
    return Array.from(userIds);
  }

  private addUserIdIfValid(user: { accountId?: string } | undefined, userIds: Set<string>): void {
    if (user?.accountId) {
      userIds.add(user.accountId);
    }
  }

  private calculateAllUserBillabilities(userIds: string[], worklogs: TempoWorklog[]): UserBillability[] {
    return userIds.map(userId => this.calculateUserBillability(userId, worklogs));
  }

  private sumTotalHours(userBillabilities: UserBillability[]): number {
    return userBillabilities.reduce((sum, user) => sum + user.totalHours, 0);
  }

  private sumBillableHours(userBillabilities: UserBillability[]): number {
    return userBillabilities.reduce((sum, user) => sum + user.billableHours, 0);
  }

  private getIdealBillabilityRatio() {
    return getBillabilityConfig();
  }

  private calculateVariance(actual: number, ideal: number): number {
    return Math.round((actual - ideal) * 100) / 100;
  }

  private isOnTarget(actual: number, ideal: number): boolean {
    return actual >= ideal;
  }
}

export const billabilityService = new BillabilityService();