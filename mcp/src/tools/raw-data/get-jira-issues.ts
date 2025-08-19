import { JiraService } from '../../services/jira.service';

export interface GetJiraIssuesParams {
  issueIds: string[];
}

export async function getJiraIssues(params: GetJiraIssuesParams): Promise<Record<string, {
  key: string;
  summary: string;
  project: {
    key: string;
    name: string;
  };
}>> {
  if (!params?.issueIds || params.issueIds.length === 0) {
    throw new Error('issueIds is required and must be a non-empty array');
  }

  const jiraService = new JiraService();
  return jiraService.getMultipleIssues(params.issueIds);
}


