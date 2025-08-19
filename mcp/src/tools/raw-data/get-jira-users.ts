import { JiraService } from '../../services/jira.service';

export interface GetJiraUsersParams {
  accountIds: string[];
}

export async function getJiraUsers(params: GetJiraUsersParams): Promise<Record<string, string>> {
  if (!params?.accountIds || params.accountIds.length === 0) {
    throw new Error('accountIds is required and must be a non-empty array');
  }

  const jiraService = new JiraService();
  return jiraService.getMultipleUsers(params.accountIds);
}


