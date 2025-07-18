import { ProjectInsightsService } from "./project-insights.service";
import { TempoWorklog } from "../types/tempo.interfaces";

describe("ProjectInsightsService", () => {
  let service: ProjectInsightsService;

  beforeEach(() => {
    service = new ProjectInsightsService();
  });

  describe("generateProjectInsights", () => {
    it("should generate insights for single project", () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 3600,
          billableSeconds: 3000,
          startDate: "2025-07-18",
          description: "Work",
          projectKey: "PROJ",
          projectName: "Project Alpha",
        },
      ];

      const result = service.generateProjectInsights(worklogs);

      expect(result.totalProjects).toBe(1);
      expect(result.projectBreakdown).toHaveLength(1);
      expect(result.projectBreakdown[0]).toEqual({
        projectKey: "PROJ",
        projectName: "Project Alpha",
        totalHours: 1,
        billableHours: 0.83,
        percentageOfTotal: 100,
      });
      expect(result.topProjects).toHaveLength(1);
    });

    it("should generate insights for multiple projects", () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 7200,
          billableSeconds: 7200,
          startDate: "2025-07-18",
          description: "Work",
          projectKey: "PROJ",
          projectName: "Project Alpha",
        },
        {
          id: "2",
          author: { accountId: "user2" },
          timeSpentSeconds: 3600,
          billableSeconds: 3600,
          startDate: "2025-07-18",
          description: "Work",
          projectKey: "OTHR",
          projectName: "Other Project",
        },
      ];

      const result = service.generateProjectInsights(worklogs);

      expect(result.totalProjects).toBe(2);
      expect(result.projectBreakdown).toHaveLength(2);
      expect(result.topProjects).toHaveLength(2);
      
      const projAlpha = result.projectBreakdown.find(p => p.projectKey === "PROJ");
      expect(projAlpha?.totalHours).toBe(2);
      expect(projAlpha?.percentageOfTotal).toBe(67);
      
      const otherProj = result.projectBreakdown.find(p => p.projectKey === "OTHR");
      expect(otherProj?.totalHours).toBe(1);
      expect(otherProj?.percentageOfTotal).toBe(33);
    });

    it("should handle worklogs without project information", () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 3600,
          billableSeconds: 3600,
          startDate: "2025-07-18",
          description: "Work",
        },
      ];

      const result = service.generateProjectInsights(worklogs);

      expect(result.totalProjects).toBe(1);
      expect(result.projectBreakdown[0]).toEqual({
        projectKey: "Unknown",
        projectName: "Unknown Project",
        totalHours: 1,
        billableHours: 1,
        percentageOfTotal: 100,
      });
    });

    it("should aggregate hours for same project", () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 3600,
          billableSeconds: 3600,
          startDate: "2025-07-18",
          description: "Work",
          projectKey: "PROJ",
          projectName: "Project Alpha",
        },
        {
          id: "2",
          author: { accountId: "user2" },
          timeSpentSeconds: 1800,
          billableSeconds: 1800,
          startDate: "2025-07-18",
          description: "More work",
          projectKey: "PROJ",
          projectName: "Project Alpha",
        },
      ];

      const result = service.generateProjectInsights(worklogs);

      expect(result.totalProjects).toBe(1);
      expect(result.projectBreakdown[0]).toEqual({
        projectKey: "PROJ",
        projectName: "Project Alpha",
        totalHours: 1.5,
        billableHours: 1.5,
        percentageOfTotal: 100,
      });
    });

    it("should return top 5 projects sorted by hours", () => {
      const worklogs: TempoWorklog[] = [];
      
      for (let i = 1; i <= 7; i++) {
        worklogs.push({
          id: i.toString(),
          author: { accountId: "user1" },
          timeSpentSeconds: 3600 * i,
          billableSeconds: 3600 * i,
          startDate: "2025-07-18",
          description: "Work",
          projectKey: `PROJ${i}`,
          projectName: `Project ${i}`,
        });
      }

      const result = service.generateProjectInsights(worklogs);

      expect(result.totalProjects).toBe(7);
      expect(result.topProjects).toHaveLength(5);
      expect(result.topProjects[0].projectKey).toBe("PROJ7");
      expect(result.topProjects[4].projectKey).toBe("PROJ3");
    });

    it("should handle empty worklog array", () => {
      const result = service.generateProjectInsights([]);

      expect(result.totalProjects).toBe(0);
      expect(result.projectBreakdown).toEqual([]);
      expect(result.topProjects).toEqual([]);
    });

    it("should handle zero total hours", () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 0,
          billableSeconds: 0,
          startDate: "2025-07-18",
          description: "Work",
          projectKey: "PROJ",
          projectName: "Project Alpha",
        },
      ];

      const result = service.generateProjectInsights(worklogs);

      expect(result.totalProjects).toBe(1);
      expect(result.projectBreakdown[0].percentageOfTotal).toBe(0);
    });

    it("should round hours and percentages correctly", () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 1234,
          billableSeconds: 567,
          startDate: "2025-07-18",
          description: "Work",
          projectKey: "PROJ",
          projectName: "Project Alpha",
        },
      ];

      const result = service.generateProjectInsights(worklogs);

      expect(result.projectBreakdown[0].totalHours).toBe(0.34);
      expect(result.projectBreakdown[0].billableHours).toBe(0.16);
    });
  });
});