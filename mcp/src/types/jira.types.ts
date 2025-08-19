export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  accountType: string;
  active: boolean;
  timeZone?: string;
}