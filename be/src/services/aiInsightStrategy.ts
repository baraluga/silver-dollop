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
  const geminiService = new GeminiService();
  const period = getCurrentWeekPeriod();
  const teamData = await teamDataService.getTeamInsights(period);
  const context = convertToQueryContext(teamData);
  const aiResponseText = await geminiService.generateInsights(query, context);
  const aiResponse = JSON.parse(aiResponseText);
  
  return {
    ...aiResponse,
    timestamp: new Date().toISOString()
  };
}