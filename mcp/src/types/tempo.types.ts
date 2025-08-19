export interface TempoWorklog {
  tempoWorklogId: number;
  jiraWorklogId: number;
  issue: {
    id: number;
    key?: string;
    accountId?: string;
    self?: string;
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
  // Additional fields that might be present
  [key: string]: any;
}

export interface UserTicketWork {
  ticketKey: string;
  ticketSummary: string;
  projectKey: string;
  projectName: string;
  hours: number;
  billableHours: number;
}

export interface UserBillability {
  userId: string;
  userName: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  billabilityPercentage: number;
  ticketWork: UserTicketWork[];
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
    displayName?: string;
    id: string;
    type: string;
  };
  planItem: {
    self: string;
    id: string;
    type: string;
  };
  plannedSecondsPerDay: number;
  totalPlannedSecondsInScope: number;
  startDate: string;
  endDate: string;
}

export interface UserPlannedWork {
  ticketKey?: string;
  ticketSummary?: string;
  projectKey?: string;
  projectName?: string;
  plannedHours: number;
}

export interface UserAvailability {
  userId: string;
  userName: string;
  plannedHours: number;
  actualHours: number;
  availabilityPercentage: number;
  plannedWork: UserPlannedWork[];
  actualWork: UserTicketWork[];
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

export interface TicketBreakdown {
  key: string;
  summary: string;
  hours: number;
  billableHours: number;
  percentageOfProject: number;
}

export interface ProjectBreakdownItem {
  projectKey: string;
  projectName: string;
  totalHours: number;
  billableHours: number;
  percentageOfTotal: number;
  tickets: TicketBreakdown[];
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