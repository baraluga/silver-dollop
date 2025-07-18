import { WorklogParser } from "./worklog-parser";

describe("WorklogParser", () => {
  describe("parseDescription", () => {
    it("should extract project key from standard issue format", () => {
      const result = WorklogParser.parseDescription("Working on PROJ-123");
      expect(result.projectKey).toBe("PROJ");
    });

    it("should extract project key from colon-prefixed format", () => {
      const result = WorklogParser.parseDescription("PROJ-456: Bug fix");
      expect(result.projectKey).toBe("PROJ");
    });

    it("should extract project key from bracketed format", () => {
      const result = WorklogParser.parseDescription("Fixed issue [PROJ-789]");
      expect(result.projectKey).toBe("PROJ");
    });

    it("should extract project key from complex project names", () => {
      const result = WorklogParser.parseDescription("Working on ABC_DEF-123");
      expect(result.projectKey).toBe("ABC_DEF");
    });

    it("should extract project key from middle of description", () => {
      const result = WorklogParser.parseDescription("Completed work for PROJ-999 today");
      expect(result.projectKey).toBe("PROJ");
    });

    it("should return undefined for description without issue key", () => {
      const result = WorklogParser.parseDescription("General development work");
      expect(result.projectKey).toBeUndefined();
    });

    it("should return undefined for empty description", () => {
      const result = WorklogParser.parseDescription("");
      expect(result.projectKey).toBeUndefined();
    });

    it("should return undefined for null description", () => {
      const result = WorklogParser.parseDescription(null as any);
      expect(result.projectKey).toBeUndefined();
    });

    it("should return undefined for undefined description", () => {
      const result = WorklogParser.parseDescription(undefined as any);
      expect(result.projectKey).toBeUndefined();
    });

    it("should handle multiple issue keys and return first project", () => {
      const result = WorklogParser.parseDescription("Fixed PROJ-123 and OTHR-456");
      expect(result.projectKey).toBe("PROJ");
    });

    it("should handle description with only whitespace", () => {
      const result = WorklogParser.parseDescription("   ");
      expect(result.projectKey).toBeUndefined();
    });

    it("should handle lowercase issue keys", () => {
      const result = WorklogParser.parseDescription("working on proj-123");
      expect(result.projectKey).toBeUndefined();
    });

    it("should handle single letter project keys", () => {
      const result = WorklogParser.parseDescription("Working on A-123");
      expect(result.projectKey).toBe("A");
    });
  });
});