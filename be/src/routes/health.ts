import { FastifyInstance } from 'fastify';
import { tempoService } from '../services/tempo.service';
import { jiraService } from '../services/jira.service';

interface HealthCheck {
  status: string;
  message: string;
}

interface HealthChecks {
  backend: HealthCheck;
  tempo: HealthCheck;
  jira: HealthCheck;
}

async function checkTempoHealth(): Promise<HealthCheck> {
  try {
    await tempoService.getTeamData();
    return { status: 'healthy', message: 'Tempo API is accessible' };
  } catch {
    return { 
      status: 'error', 
      message: 'Tempo API connection failed. Check TEMPO_API_TOKEN in .env file' 
    };
  }
}

async function checkJiraHealth(): Promise<HealthCheck> {
  try {
    await jiraService.getUserData();
    return { status: 'healthy', message: 'JIRA API is accessible' };
  } catch {
    return { 
      status: 'error', 
      message: 'JIRA API connection failed. Check JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env file' 
    };
  }
}

function determineOverallStatus(checks: HealthChecks): string {
  const isHealthy = Object.values(checks).every(check => check.status === 'healthy');
  return isHealthy ? 'healthy' : 'degraded';
}

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => {
    const checks: HealthChecks = {
      backend: { status: 'healthy', message: 'Backend is running' },
      tempo: await checkTempoHealth(),
      jira: await checkJiraHealth()
    };

    return {
      status: determineOverallStatus(checks),
      timestamp: new Date().toISOString(),
      checks
    };
  });
}