import { TempoUser, TempoWorklog, TempoPlan } from "../types/tempo.interfaces";
import { nullSafe } from "./null-safe";

export class TempoCommon {
  static matchesUserId(user: TempoUser | undefined, userId: string): boolean {
    return nullSafe.object<TempoUser>(user).accountId === userId;
  }

  static convertSecondsToHours(seconds: number): number {
    return Math.round((seconds / 3600) * 100) / 100;
  }

  static calculatePercentage(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100 * 100) / 100;
  }

  static filterUserWorklogs(
    userId: string,
    worklogs: TempoWorklog[],
  ): TempoWorklog[] {
    return worklogs.filter((worklog) =>
      this.matchesUserId(worklog.author, userId),
    );
  }

  static extractUserName(userId: string, worklogs: TempoWorklog[]): string {
    const userWorklog = worklogs.find((worklog) =>
      this.matchesUserId(worklog.author, userId),
    );
    return nullSafe.string(userWorklog?.author?.displayName, "Unknown User");
  }

  static extractUniqueUserIds(worklogs: TempoWorklog[]): string[] {
    const userIds = new Set<string>();
    worklogs.forEach((worklog) =>
      this.addUserIdIfValid(worklog.author, userIds),
    );
    return Array.from(userIds).filter(Boolean);
  }

  static extractUniqueUserIdsFromPlans(plans: TempoPlan[]): string[] {
    const userIds = new Set<string>();
    plans.forEach((plan) => this.addUserIdIfValid(plan.assignee, userIds));
    return Array.from(userIds).filter(Boolean);
  }

  static extractUniqueUserIdsFromPlansAndWorklogs(
    plans: TempoPlan[],
    worklogs: TempoWorklog[],
  ): string[] {
    const worklogUserIds = this.extractUniqueUserIds(worklogs);
    const planUserIds = this.extractUniqueUserIdsFromPlans(plans);
    return [...new Set([...worklogUserIds, ...planUserIds])];
  }

  private static addUserIdIfValid(
    user: { accountId?: string; id?: string } | undefined,
    userIds: Set<string>,
  ): void {
    const accountId = nullSafe.object<{ accountId: string }>(user).accountId;
    userIds.add(accountId);
  }
}
