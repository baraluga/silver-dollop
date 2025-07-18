import { TempoWorklog } from "../types/tempo.interfaces";
import { JiraProject } from "../types/jira.interfaces";
import { WorklogParser } from "../util/worklog-parser";
import { jiraService } from "./jira.service";

export class WorklogEnrichmentService {
  async enrichWorklogsWithProjects(worklogs: TempoWorklog[]): Promise<TempoWorklog[]> {
    const projectKeys = this.extractUniqueProjectKeys(worklogs);
    const projectDirectory = await jiraService.getProjectsByKeys(projectKeys);
    
    return this.applyProjectData(worklogs, projectDirectory);
  }

  private extractUniqueProjectKeys(worklogs: TempoWorklog[]): string[] {
    const projectKeys = new Set<string>();
    
    worklogs.forEach((worklog) => {
      const parsed = WorklogParser.parseDescription(worklog.description);
      if (parsed.projectKey) {
        projectKeys.add(parsed.projectKey);
      }
    });
    
    return Array.from(projectKeys);
  }

  private applyProjectData(
    worklogs: TempoWorklog[], 
    projectDirectory: Record<string, JiraProject>
  ): TempoWorklog[] {
    return worklogs.map((worklog) => ({
      ...worklog,
      ...this.getProjectDataForWorklog(worklog, projectDirectory),
    }));
  }

  private getProjectDataForWorklog(
    worklog: TempoWorklog, 
    projectDirectory: Record<string, JiraProject>
  ): { projectKey?: string; projectName?: string } {
    const parsed = WorklogParser.parseDescription(worklog.description);
    
    if (parsed.projectKey && projectDirectory[parsed.projectKey]) {
      const project = projectDirectory[parsed.projectKey];
      return {
        projectKey: project.key,
        projectName: project.name,
      };
    }
    
    return {};
  }
}