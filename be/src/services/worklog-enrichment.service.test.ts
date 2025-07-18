import { WorklogEnrichmentService } from "./worklog-enrichment.service";
import { TempoWorklog } from "../types/tempo.interfaces";
import { jiraService } from "./jira.service";

jest.mock("./jira.service");

const mockJiraService = jiraService as jest.Mocked<typeof jiraService>;

describe("WorklogEnrichmentService", () => {
  let service: WorklogEnrichmentService;

  beforeEach(() => {
    service = new WorklogEnrichmentService();
    jest.clearAllMocks();
  });

  describe("enrichWorklogsWithProjects", () => {
    it("should enrich worklogs with project information", async () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 3600,
          billableSeconds: 3600,
          startDate: "2025-07-18",
          description: "Working on PROJ-123",
        },
      ];

      mockJiraService.getProjectsByKeys.mockResolvedValue({
        PROJ: {
          id: "10000",
          key: "PROJ",
          name: "Project Alpha",
          projectTypeKey: "software",
        },
      });

      const result = await service.enrichWorklogsWithProjects(worklogs);

      expect(result[0].projectKey).toBe("PROJ");
      expect(result[0].projectName).toBe("Project Alpha");
      expect(mockJiraService.getProjectsByKeys).toHaveBeenCalledWith(["PROJ"]);
    });

    it("should handle worklogs without project information", async () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 3600,
          billableSeconds: 3600,
          startDate: "2025-07-18",
          description: "General work",
        },
      ];

      mockJiraService.getProjectsByKeys.mockResolvedValue({});

      const result = await service.enrichWorklogsWithProjects(worklogs);

      expect(result[0].projectKey).toBeUndefined();
      expect(result[0].projectName).toBeUndefined();
      expect(mockJiraService.getProjectsByKeys).toHaveBeenCalledWith([]);
    });

    it("should handle multiple worklogs with same project", async () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 3600,
          billableSeconds: 3600,
          startDate: "2025-07-18",
          description: "Working on PROJ-123",
        },
        {
          id: "2",
          author: { accountId: "user2" },
          timeSpentSeconds: 1800,
          billableSeconds: 1800,
          startDate: "2025-07-18",
          description: "PROJ-456: Bug fix",
        },
      ];

      mockJiraService.getProjectsByKeys.mockResolvedValue({
        PROJ: {
          id: "10000",
          key: "PROJ",
          name: "Project Alpha",
          projectTypeKey: "software",
        },
      });

      const result = await service.enrichWorklogsWithProjects(worklogs);

      expect(result[0].projectKey).toBe("PROJ");
      expect(result[1].projectKey).toBe("PROJ");
      expect(mockJiraService.getProjectsByKeys).toHaveBeenCalledWith(["PROJ"]);
    });

    it("should handle multiple worklogs with different projects", async () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 3600,
          billableSeconds: 3600,
          startDate: "2025-07-18",
          description: "Working on PROJ-123",
        },
        {
          id: "2",
          author: { accountId: "user2" },
          timeSpentSeconds: 1800,
          billableSeconds: 1800,
          startDate: "2025-07-18",
          description: "OTHR-456: Feature",
        },
      ];

      mockJiraService.getProjectsByKeys.mockResolvedValue({
        PROJ: {
          id: "10000",
          key: "PROJ",
          name: "Project Alpha",
          projectTypeKey: "software",
        },
        OTHR: {
          id: "10001",
          key: "OTHR",
          name: "Other Project",
          projectTypeKey: "software",
        },
      });

      const result = await service.enrichWorklogsWithProjects(worklogs);

      expect(result[0].projectKey).toBe("PROJ");
      expect(result[0].projectName).toBe("Project Alpha");
      expect(result[1].projectKey).toBe("OTHR");
      expect(result[1].projectName).toBe("Other Project");
      expect(mockJiraService.getProjectsByKeys).toHaveBeenCalledWith(["PROJ", "OTHR"]);
    });

    it("should handle empty worklog array", async () => {
      const result = await service.enrichWorklogsWithProjects([]);

      expect(result).toEqual([]);
      expect(mockJiraService.getProjectsByKeys).toHaveBeenCalledWith([]);
    });

    it("should handle JIRA service returning partial project data", async () => {
      const worklogs: TempoWorklog[] = [
        {
          id: "1",
          author: { accountId: "user1" },
          timeSpentSeconds: 3600,
          billableSeconds: 3600,
          startDate: "2025-07-18",
          description: "Working on PROJ-123",
        },
        {
          id: "2",
          author: { accountId: "user2" },
          timeSpentSeconds: 1800,
          billableSeconds: 1800,
          startDate: "2025-07-18",
          description: "MISSING-456: Feature",
        },
      ];

      mockJiraService.getProjectsByKeys.mockResolvedValue({
        PROJ: {
          id: "10000",
          key: "PROJ",
          name: "Project Alpha",
          projectTypeKey: "software",
        },
      });

      const result = await service.enrichWorklogsWithProjects(worklogs);

      expect(result[0].projectKey).toBe("PROJ");
      expect(result[0].projectName).toBe("Project Alpha");
      expect(result[1].projectKey).toBeUndefined();
      expect(result[1].projectName).toBeUndefined();
    });
  });
});