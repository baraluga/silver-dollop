import { TempoWorklog } from "../types/tempo.interfaces";

export interface ProjectInsights {
  totalProjects: number;
  projectBreakdown: ProjectBreakdownItem[];
  topProjects: ProjectBreakdownItem[];
}

export interface ProjectBreakdownItem {
  projectKey: string;
  projectName: string;
  totalHours: number;
  billableHours: number;
  percentageOfTotal: number;
}

interface ProjectStats {
  projectKey: string;
  projectName: string;
  totalSeconds: number;
  billableSeconds: number;
}

export class ProjectInsightsService {
  generateProjectInsights(worklogs: TempoWorklog[]): ProjectInsights {
    const projectStats = this.calculateProjectStats(worklogs);
    const totalHours = this.calculateTotalHours(worklogs);
    
    const projectBreakdown = this.buildProjectBreakdown(projectStats, totalHours);
    const topProjects = this.getTopProjects(projectBreakdown);
    
    return {
      totalProjects: Object.keys(projectStats).length,
      projectBreakdown,
      topProjects,
    };
  }

  private calculateProjectStats(worklogs: TempoWorklog[]): Record<string, ProjectStats> {
    const stats: Record<string, ProjectStats> = {};
    
    worklogs.forEach((worklog) => {
      this.processWorklog(worklog, stats);
    });
    
    return stats;
  }

  private processWorklog(worklog: TempoWorklog, stats: Record<string, ProjectStats>): void {
    const key = this.getProjectIdentifier(worklog);
    
    if (!stats[key]) {
      stats[key] = this.createProjectStats(worklog);
    }
    
    this.updateProjectStats(stats[key], worklog);
  }

  private createProjectStats(worklog: TempoWorklog): ProjectStats {
    return {
      projectKey: worklog.projectKey || 'Unknown',
      projectName: worklog.projectName || 'Unknown Project',
      totalSeconds: 0,
      billableSeconds: 0,
    };
  }

  private updateProjectStats(stats: ProjectStats, worklog: TempoWorklog): void {
    stats.totalSeconds += worklog.timeSpentSeconds;
    stats.billableSeconds += worklog.billableSeconds;
  }

  private getProjectIdentifier(worklog: TempoWorklog): string {
    return worklog.projectKey || 'unknown';
  }

  private calculateTotalHours(worklogs: TempoWorklog[]): number {
    return worklogs.reduce((total, worklog) => total + worklog.timeSpentSeconds, 0) / 3600;
  }

  private buildProjectBreakdown(
    projectStats: Record<string, ProjectStats>, 
    totalHours: number
  ): ProjectBreakdownItem[] {
    return Object.values(projectStats).map((stats) => ({
      projectKey: stats.projectKey,
      projectName: stats.projectName,
      totalHours: Math.round(stats.totalSeconds / 3600 * 100) / 100,
      billableHours: Math.round(stats.billableSeconds / 3600 * 100) / 100,
      percentageOfTotal: totalHours > 0 ? Math.round((stats.totalSeconds / 3600) / totalHours * 100) : 0,
    }));
  }

  private getTopProjects(breakdown: ProjectBreakdownItem[]): ProjectBreakdownItem[] {
    return breakdown
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);
  }
}