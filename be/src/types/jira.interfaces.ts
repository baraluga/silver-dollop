export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
  avatarUrls: {
    "48x48": string;
  };
  active: boolean;
}

export interface JiraApiResponse<T> {
  values: T[];
  isLast: boolean;
  startAt: number;
  maxResults: number;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}
