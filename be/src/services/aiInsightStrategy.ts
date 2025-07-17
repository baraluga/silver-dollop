import { GeminiService, QueryContext } from './gemini.service';
import { teamDataService, TeamInsights } from './team-data.service';

type InsightResponse = {
  title: string;
  summary: string;
  insights: string[];
  timestamp: string;
};

function getCurrentWeekPeriod() {
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    from: weekStart.toISOString().split('T')[0],
    to: weekEnd.toISOString().split('T')[0]
  };
}

function convertToQueryContext(teamData: TeamInsights): QueryContext {
  return {
    availabilityData: teamData.availability,
    billabilityData: teamData.billability,
    trend: teamData.trend,
    period: teamData.period
  };
}

export async function processQueryWithAI(query: string): Promise<InsightResponse> {
  try {
    const response = await getAIInsights(query);
    return addTimestamp(response);
  } catch (error) {
    console.error('AI processing error:', error);
    return createFallbackResponse();
  }
}

async function getAIInsights(query: string): Promise<Omit<InsightResponse, 'timestamp'>> {
  const geminiService = new GeminiService();
  const context = await getQueryContext();
  const aiResponseText = await geminiService.generateInsights(query, context);
  return parseAIResponse(aiResponseText);
}

async function getQueryContext() {
  const period = getCurrentWeekPeriod();
  const teamData = await teamDataService.getTeamInsights(period);
  return convertToQueryContext(teamData);
}

function addTimestamp(response: Omit<InsightResponse, 'timestamp'>): InsightResponse {
  return {
    ...response,
    timestamp: new Date().toISOString()
  };
}

function parseAIResponse(responseText: string): Omit<InsightResponse, 'timestamp'> {
  try {
    const cleanedResponse = extractJSONFromMarkdown(responseText);
    const parsed = JSON.parse(cleanedResponse);
    
    return validateAIResponse(parsed);
  } catch (parseError) {
    console.error('JSON parsing failed:', parseError);
    console.error('Response text:', responseText);
    throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
  }
}

function extractJSONFromMarkdown(responseText: string): string {
  const trimmed = responseText.trim();
  
  if (hasMarkdownWrapping(trimmed)) {
    return extractFromCodeBlock(trimmed);
  }
  
  return trimmed;
}

function hasMarkdownWrapping(text: string): boolean {
  return [
    hasJSONCodeBlock(text),
    hasGenericCodeBlock(text)
  ].some(Boolean);
}

function hasJSONCodeBlock(text: string): boolean {
  return [
    text.startsWith('```json'),
    text.endsWith('```')
  ].every(Boolean);
}

function hasGenericCodeBlock(text: string): boolean {
  return [
    text.startsWith('```'),
    text.endsWith('```')
  ].every(Boolean);
}

function extractFromCodeBlock(text: string): string {
  const lines = text.split('\n');
  // Remove first line (```json or ```) and last line (```)
  const jsonLines = lines.slice(1, -1);
  return jsonLines.join('\n').trim();
}

function validateAIResponse(parsed: unknown): Omit<InsightResponse, 'timestamp'> {
  if (!isValidObject(parsed)) {
    throw new Error('AI response is not a valid object');
  }
  
  const response = parsed as Record<string, unknown>;
  validateRequiredFields(response);
  
  return {
    title: response.title as string,
    summary: response.summary as string,
    insights: filterStringInsights(response.insights as unknown[])
  };
}

function isValidObject(parsed: unknown): boolean {
  return typeof parsed === 'object' && parsed !== null;
}

function validateRequiredFields(response: Record<string, unknown>): void {
  validateTitle(response.title);
  validateSummary(response.summary);
  validateInsights(response.insights);
}

function validateTitle(title: unknown): void {
  if (!isValidTitle(title)) {
    throw new Error('AI response missing required field: title');
  }
}

function validateSummary(summary: unknown): void {
  if (!isValidSummary(summary)) {
    throw new Error('AI response missing required field: summary');
  }
}

function validateInsights(insights: unknown): void {
  if (!isValidInsights(insights)) {
    throw new Error('AI response missing required field: insights');
  }
}

function isValidTitle(title: unknown): boolean {
  return typeof title === 'string';
}

function isValidSummary(summary: unknown): boolean {
  return typeof summary === 'string';
}

function isValidInsights(insights: unknown): boolean {
  return Array.isArray(insights);
}

function filterStringInsights(insights: unknown[]): string[] {
  return insights.filter(insight => typeof insight === 'string') as string[];
}

function createFallbackResponse(): InsightResponse {
  return {
    title: 'Analysis Error',
    summary: 'Unable to process your query at this time. Please try again.',
    insights: [
      'The AI service encountered an error while processing your request',
      'Please check your query and try again',
      'Contact support if the issue persists'
    ],
    timestamp: new Date().toISOString()
  };
}