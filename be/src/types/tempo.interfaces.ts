export interface TempoUser {
  accountId?: string;
  id?: string;
  displayName?: string;
}

export interface TempoPlan {
  id: string;
  assignee: TempoUser;
  totalPlannedSecondsInScope: number;
  startDate: string;
  endDate: string;
}

export interface TempoWorklog {
  id: string;
  author: TempoUser;
  timeSpentSeconds: number;
  billableSeconds: number;
  startDate: string;
  description: string;
}

export interface TempoTeam {
  id: string;
  name: string;
  members: TempoUser[];
}
