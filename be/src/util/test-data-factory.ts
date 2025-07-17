import { TempoPlan, TempoWorklog, TempoUser } from "../types/tempo.interfaces";

export class TestDataFactory {
  static createTempoUser(overrides: Partial<TempoUser> = {}): TempoUser {
    return {
      accountId: "user1",
      displayName: "John Doe",
      ...overrides,
    };
  }

  static createTempoPlan(overrides: Partial<TempoPlan> = {}): TempoPlan {
    return {
      id: "1",
      assignee: this.createTempoUser(),
      totalPlannedSecondsInScope: 28800, // 8 hours
      startDate: "2024-01-01",
      endDate: "2024-01-01",
      ...overrides,
    };
  }

  static createTempoWorklog(
    overrides: Partial<TempoWorklog> = {},
  ): TempoWorklog {
    return {
      id: "1",
      author: this.createTempoUser(),
      timeSpentSeconds: 21600, // 6 hours
      billableSeconds: 21600, // 6 hours
      startDate: "2024-01-01",
      description: "Work done",
      ...overrides,
    };
  }

  static createMultiplePlans(count: number, userPrefix = "user"): TempoPlan[] {
    return Array.from({ length: count }, (unused, index) =>
      this.createTempoPlan({
        id: `${index + 1}`,
        assignee: this.createTempoUser({
          accountId: `${userPrefix}${index + 1}`,
          displayName: `User ${index + 1}`,
        }),
      }),
    );
  }

  static createMultipleWorklogs(
    count: number,
    userPrefix = "user",
  ): TempoWorklog[] {
    return Array.from({ length: count }, (unused, index) =>
      this.createTempoWorklog({
        id: `${index + 1}`,
        author: this.createTempoUser({
          accountId: `${userPrefix}${index + 1}`,
          displayName: `User ${index + 1}`,
        }),
      }),
    );
  }
}
