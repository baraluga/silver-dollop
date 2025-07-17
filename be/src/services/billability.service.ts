import { getBillabilityConfig } from "../config/billability.config";
import { TempoWorklog } from "../types/tempo.interfaces";
import { TempoCommon } from "../util/tempo-common";

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
  calculateUserBillability(
    userId: string,
    worklogs: TempoWorklog[],
  ): UserBillability {
    const userWorklogs = this.filterUserWorklogs(userId, worklogs);
    const hours = this.calculateHours(userWorklogs);

    return {
      userId,
      userName: this.extractUserName(userId, worklogs),
      ...hours,
      billabilityPercentage: this.calculatePercentage(
        hours.billableHours,
        hours.totalHours,
      ),
    };
  }

  calculateTeamBillability(worklogs: TempoWorklog[]): TeamBillability {
    const userIds = this.extractUniqueUserIds(worklogs);
    const userBillabilities = this.calculateAllUserBillabilities(
      userIds,
      worklogs,
    );
    const teamHours = this.aggregateTeamHours(userBillabilities);

    return {
      ...teamHours,
      teamBillabilityPercentage: this.calculatePercentage(
        teamHours.billableHours,
        teamHours.totalHours,
      ),
      userBillabilities,
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
      variance,
    };
  }

  private filterUserWorklogs(
    userId: string,
    worklogs: TempoWorklog[],
  ): TempoWorklog[] {
    return TempoCommon.filterUserWorklogs(userId, worklogs);
  }

  private calculateTotalHours(worklogs: TempoWorklog[]): number {
    const totalSeconds = worklogs.reduce(
      (sum, worklog) => sum + worklog.timeSpentSeconds,
      0,
    );
    return this.convertSecondsToHours(totalSeconds);
  }

  private calculateBillableHours(worklogs: TempoWorklog[]): number {
    const billableSeconds = worklogs.reduce(
      (sum, worklog) => sum + worklog.billableSeconds,
      0,
    );
    return this.convertSecondsToHours(billableSeconds);
  }

  private calculateNonBillableHours(
    totalHours: number,
    billableHours: number,
  ): number {
    return Math.round((totalHours - billableHours) * 100) / 100;
  }

  private convertSecondsToHours(seconds: number): number {
    return TempoCommon.convertSecondsToHours(seconds);
  }

  private calculatePercentage(billable: number, total: number): number {
    return TempoCommon.calculatePercentage(billable, total);
  }

  private extractUserName(userId: string, worklogs: TempoWorklog[]): string {
    return TempoCommon.extractUserName(userId, worklogs);
  }

  private extractUniqueUserIds(worklogs: TempoWorklog[]): string[] {
    return TempoCommon.extractUniqueUserIds(worklogs);
  }

  private calculateHours(worklogs: TempoWorklog[]) {
    const totalHours = this.calculateTotalHours(worklogs);
    const billableHours = this.calculateBillableHours(worklogs);
    const nonBillableHours = this.calculateNonBillableHours(
      totalHours,
      billableHours,
    );

    return { totalHours, billableHours, nonBillableHours };
  }

  private aggregateTeamHours(userBillabilities: UserBillability[]) {
    const totalHours = this.sumTotalHours(userBillabilities);
    const billableHours = this.sumBillableHours(userBillabilities);
    const nonBillableHours = this.calculateNonBillableHours(
      totalHours,
      billableHours,
    );

    return { totalHours, billableHours, nonBillableHours };
  }

  private calculateAllUserBillabilities(
    userIds: string[],
    worklogs: TempoWorklog[],
  ): UserBillability[] {
    return userIds.map((userId) =>
      this.calculateUserBillability(userId, worklogs),
    );
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
