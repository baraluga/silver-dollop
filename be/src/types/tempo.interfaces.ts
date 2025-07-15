export interface TempoUser {
  accountId: string;
  displayName: string;
}

export interface TempoPlan {
  id: string;
  user: TempoUser;
  plannedSeconds: number;
  startDate: string;
  endDate: string;
}

export interface TempoWorklog {
  id: string;
  user: TempoUser;
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