export interface TempoWorklog {
  tempoWorklogId: number;
  jiraWorklogId: number;
  issue: {
    id: number;
    key: string;
    accountId: string;
  };
  timeSpentSeconds: number;
  billableSeconds: number;
  startDate: string;
  startTime: string;
  description: string;
  author: {
    accountId: string;
    displayName: string;
  };
}

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
  period: {
    from: string;
    to: string;
  };
}