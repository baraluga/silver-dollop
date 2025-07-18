export interface ParsedWorklogData {
  projectKey?: string;
}

export class WorklogParser {
  private static readonly ISSUE_KEY_PATTERNS = [
    /\b([A-Z][A-Z0-9_]*-\d+)\b/g, // Standard: PROJ-123, ABC_DEF-456
    /^([A-Z][A-Z0-9_]*-\d+):/,     // Start with colon: PROJ-123: Description
    /\[([A-Z][A-Z0-9_]*-\d+)\]/g,  // Bracketed: [PROJ-123]
  ];

  static parseDescription(description: string): ParsedWorklogData {
    const projectKey = this.extractProjectKey(description);
    return { projectKey };
  }

  private static extractProjectKey(description: string): string | undefined {
    if (!description?.trim()) {
      return undefined;
    }

    return this.findMatchingPattern(description);
  }

  private static findMatchingPattern(description: string): string | undefined {
    for (const pattern of this.ISSUE_KEY_PATTERNS) {
      const result = this.extractFromPattern(description, pattern);
      if (result) {
        return result;
      }
    }
    return undefined;
  }

  private static extractFromPattern(description: string, pattern: RegExp): string | undefined {
    const matches = description.match(pattern);
    if (matches && matches.length > 0) {
      const issueKey = matches[0].replace(/[[\]:]/g, '');
      return this.extractProjectFromIssueKey(issueKey);
    }
    return undefined;
  }

  private static extractProjectFromIssueKey(issueKey: string): string {
    const parts = issueKey.split('-');
    return parts[0];
  }
}