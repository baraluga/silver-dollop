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

export interface TempoPlan {
  id: number;
  assignee: {
    accountId: string;
    displayName: string;
  };
  plannedSecondsPerDay: number;
  totalPlannedSecondsInScope: number;
  startDate: string;
  endDate: string;
}

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
  period: {
    from: string;
    to: string;
  };
}

export interface ProjectBreakdownItem {
  projectKey: string;
  projectName: string;
  totalHours: number;
  billableHours: number;
  percentageOfTotal: number;
}

export interface ProjectInsights {
  totalProjects: number;
  projectBreakdown: ProjectBreakdownItem[];
  topProjects: ProjectBreakdownItem[];
  period: {
    from: string;
    to: string;
  };
}