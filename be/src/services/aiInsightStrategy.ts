import { DateParsingService } from "./date-parsing.service";
import { GeminiService, QueryContext } from "./gemini.service";
import { jiraService } from "./jira.service";
import { teamDataService, TeamInsights } from "./team-data.service";

type InsightResponse = {
  title: string;
  summary: string;
  insights: string[];
  timestamp: string;
  thoughtProcess?: string;
};

function getCurrentWeekPeriod() {
  const now = new Date();
  const weekStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay()
  );
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    from: weekStart.toISOString().split("T")[0],
    to: weekEnd.toISOString().split("T")[0],
  };
}

function getPeriodFromQuery(query: string) {
  const dateParsingService = new DateParsingService();
  const parsedDate = dateParsingService.parseQueryDate(query);

  if (parsedDate) {
    return {
      from: parsedDate.startDate,
      to: parsedDate.endDate,
    };
  }

  return getCurrentWeekPeriod();
}

async function convertToQueryContext(
  teamData: TeamInsights
): Promise<QueryContext> {
  return {
    availabilityData: teamData.availability,
    billabilityData: teamData.billability,
    trend: teamData.trend,
    period: teamData.period,
    userDirectory: await buildUserDirectory(teamData),
  };
}

async function buildUserDirectory(
  teamData: TeamInsights
): Promise<Record<string, string>> {
  const userIds = collectUniqueUserIds(teamData);
  return await fetchUserNames(userIds);
}

function collectUniqueUserIds(teamData: TeamInsights): Set<string> {
  const userIds = new Set<string>();

  teamData.availability.userAvailabilities.forEach((user) => {
    userIds.add(user.userId);
  });

  teamData.billability.userBillabilities.forEach((user) => {
    userIds.add(user.userId);
  });

  return userIds;
}

async function fetchUserNames(
  userIds: Set<string>
): Promise<Record<string, string>> {
  if (userIds.size === 0) return {};
  return await fetchFromJira(userIds);
}

async function fetchFromJira(
  userIds: Set<string>
): Promise<Record<string, string>> {
  const userDirectory: Record<string, string> = {};
  const users = await jiraService.getUsersByAccountIds(Array.from(userIds));

  users.forEach((user) => {
    userDirectory[user.accountId] = user.displayName;
  });

  return userDirectory;
}

export async function processQueryWithAI(
  query: string
): Promise<InsightResponse> {
  try {
    const response = await getAIInsights(query);
    return addTimestamp(response);
  } catch {
    return createFallbackResponse();
  }
}

async function getAIInsights(
  query: string
): Promise<Omit<InsightResponse, "timestamp">> {
  const geminiService = new GeminiService();
  const context = await getQueryContext(query);
  const aiResponseText = await geminiService.generateInsights(query, context);
  return parseAIResponse(aiResponseText);
}

async function getQueryContext(query: string) {
  const period = getPeriodFromQuery(query);
  const teamData = await teamDataService.getTeamInsights(period);
  return await convertToQueryContext(teamData);
}

function addTimestamp(
  response: Omit<InsightResponse, "timestamp">
): InsightResponse {
  return {
    ...response,
    timestamp: new Date().toISOString(),
  };
}

function parseAIResponse(
  responseText: string
): Omit<InsightResponse, "timestamp"> {
  const cleanedResponse = extractJSONFromMarkdown(responseText);
  const parsed = JSON.parse(cleanedResponse);
  return validateAIResponse(parsed);
}

function extractJSONFromMarkdown(responseText: string): string {
  const trimmed = responseText.trim();

  if (hasMarkdownWrapping(trimmed)) {
    return extractFromCodeBlock(trimmed);
  }

  return trimmed;
}

function hasMarkdownWrapping(text: string): boolean {
  return [hasJSONCodeBlock(text), hasGenericCodeBlock(text)].some(Boolean);
}

function hasJSONCodeBlock(text: string): boolean {
  return [text.startsWith("```json"), text.endsWith("```")].every(Boolean);
}

function hasGenericCodeBlock(text: string): boolean {
  return [text.startsWith("```"), text.endsWith("```")].every(Boolean);
}

function extractFromCodeBlock(text: string): string {
  const lines = text.split("\n");
  // Remove first line (```json or ```) and last line (```)
  const jsonLines = lines.slice(1, -1);
  return jsonLines.join("\n").trim();
}

function validateAIResponse(
  parsed: unknown
): Omit<InsightResponse, "timestamp"> {
  const response = parsed as Record<string, unknown>;
  console.log("AI Response:", response);
  return {
    title: response.title as string,
    summary: response.summary as string,
    insights: filterStringInsights(response.insights as unknown[]),
    thoughtProcess: response.thoughtProcess as string,
  };
}

function filterStringInsights(insights: unknown[]): string[] {
  return insights.filter((insight) => typeof insight === "string") as string[];
}

function createFallbackResponse(): InsightResponse {
  return {
    title: "Analysis Error",
    summary: "Unable to process your query at this time. Please try again.",
    insights: [
      "The AI service encountered an error while processing your request",
      "Please check your query and try again",
      "Contact support if the issue persists",
    ],
    timestamp: new Date().toISOString(),
  };
}
