#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  getTeamBillability,
  getTeamAvailability,
  getProjectInsights,
  getTempoWorklogs,
  getTempoPlans,
  getJiraUsers,
  getJiraIssues,
  calculateBillability,
  calculateAvailability,
  analyzeProjectDistribution,
  getUserTicketWork,
  getProjectTicketBreakdown
} from './tools/index.js';

const server = new Server(
  {
    name: 'team-insights-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_team_billability',
        description: 'Get team billability metrics including individual and team percentages',
        inputSchema: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: {
              type: 'string',
              description: 'Start date in YYYY-MM-DD format (required)',
            },
            to: {
              type: 'string',
              description: 'End date in YYYY-MM-DD format (required)',
            },
            userId: {
              type: 'string',
              description: 'Specific user account ID to get billability for (optional, returns all users if not specified)',
            },
          },
        },
      },
      {
        name: 'get_tempo_worklogs',
        description: 'Retrieve raw worklog data from Tempo API',
        inputSchema: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: { type: 'string', description: 'Start date in YYYY-MM-DD format (required)' },
            to: { type: 'string', description: 'End date in YYYY-MM-DD format (required)' },
            userId: { type: 'string', description: 'Optional Tempo/Jira account ID to filter worklogs' }
          }
        }
      },
      {
        name: 'get_tempo_plans',
        description: 'Retrieve raw planning data from Tempo API',
        inputSchema: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: { type: 'string', description: 'Start date in YYYY-MM-DD format (required)' },
            to: { type: 'string', description: 'End date in YYYY-MM-DD format (required)' },
            userId: { type: 'string', description: 'Optional Tempo/Jira account ID to filter plans' }
          }
        }
      },
      {
        name: 'get_jira_users',
        description: 'Convert Jira account IDs to display names',
        inputSchema: {
          type: 'object',
          required: ['accountIds'],
          properties: {
            accountIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of Jira account IDs'
            }
          }
        }
      },
      {
        name: 'get_jira_issues',
        description: 'Get issue details (key, summary, project info) for given issue IDs',
        inputSchema: {
          type: 'object',
          required: ['issueIds'],
          properties: {
            issueIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of Jira issue ID strings'
            }
          }
        }
      },
      {
        name: 'calculate_billability',
        description: 'Calculate billability percentages from worklog data',
        inputSchema: {
          type: 'object',
          required: ['worklogs'],
          properties: {
            worklogs: { type: 'array', description: 'Raw Tempo worklogs' },
            users: {
              type: 'object',
              additionalProperties: { type: 'string' },
              description: 'Optional {accountId: displayName} mapping'
            }
          }
        }
      },
      {
        name: 'calculate_availability',
        description: 'Calculate availability (planned vs actual) percentages',
        inputSchema: {
          type: 'object',
          required: ['plans', 'worklogs'],
          properties: {
            plans: { type: 'array', description: 'Raw Tempo plans' },
            worklogs: { type: 'array', description: 'Raw Tempo worklogs' },
            users: {
              type: 'object',
              additionalProperties: { type: 'string' },
              description: 'Optional {accountId: displayName} mapping'
            }
          }
        }
      },
      {
        name: 'analyze_project_distribution',
        description: 'Calculate time distribution across projects',
        inputSchema: {
          type: 'object',
          required: ['worklogs'],
          properties: {
            worklogs: { type: 'array', description: 'Raw Tempo worklogs' },
            issues: { type: 'object', description: 'Optional issue details map' }
          }
        }
      },
      {
        name: 'get_user_ticket_work',
        description: 'Break down work by user → tickets with full context',
        inputSchema: {
          type: 'object',
          required: ['worklogs', 'issues'],
          properties: {
            worklogs: { type: 'array', description: 'Raw Tempo worklogs' },
            issues: { type: 'object', description: 'Issue details map' }
          }
        }
      },
      {
        name: 'get_project_ticket_breakdown',
        description: 'Break down work by project → tickets',
        inputSchema: {
          type: 'object',
          required: ['worklogs', 'issues'],
          properties: {
            worklogs: { type: 'array', description: 'Raw Tempo worklogs' },
            issues: { type: 'object', description: 'Issue details map' }
          }
        }
      },
      {
        name: 'get_team_availability',
        description: 'Get team availability metrics comparing planned vs actual hours worked',
        inputSchema: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: {
              type: 'string',
              description: 'Start date in YYYY-MM-DD format (required)',
            },
            to: {
              type: 'string',
              description: 'End date in YYYY-MM-DD format (required)',
            },
            userId: {
              type: 'string',
              description: 'Specific user account ID to get availability for (optional, returns all users if not specified)',
            },
          },
        },
      },
      {
        name: 'get_project_insights',
        description: 'Get project-level time allocation and resource distribution insights',
        inputSchema: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: {
              type: 'string',
              description: 'Start date in YYYY-MM-DD format (required)',
            },
            to: {
              type: 'string',
              description: 'End date in YYYY-MM-DD format (required)',
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_team_billability':
      try {
        const params = args as {
          from: string;
          to: string;
          userId?: string;
        };
        
        const result = await getTeamBillability(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
            },
          ],
          isError: true,
        };
      }

    case 'get_tempo_worklogs':
      try {
        const params = args as { from: string; to: string; userId?: string };
        const result = await getTempoWorklogs(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` }], isError: true };
      }

    case 'get_tempo_plans':
      try {
        const params = args as { from: string; to: string; userId?: string };
        const result = await getTempoPlans(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` }], isError: true };
      }

    case 'get_jira_users':
      try {
        const params = args as { accountIds: string[] };
        const result = await getJiraUsers(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` }], isError: true };
      }

    case 'get_jira_issues':
      try {
        const params = args as { issueIds: string[] };
        const result = await getJiraIssues(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` }], isError: true };
      }

    case 'calculate_billability':
      try {
        const params = args as { worklogs: any[]; users?: Record<string, string> };
        const result = calculateBillability(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` }], isError: true };
      }

    case 'calculate_availability':
      try {
        const params = args as { plans: any[]; worklogs: any[]; users?: Record<string, string> };
        const result = calculateAvailability(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` }], isError: true };
      }

    case 'analyze_project_distribution':
      try {
        const params = args as { worklogs: any[]; issues?: Record<string, any> };
        const result = analyzeProjectDistribution(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` }], isError: true };
      }

    case 'get_user_ticket_work':
      try {
        const params = args as { worklogs: any[]; issues: Record<string, any> };
        const result = getUserTicketWork(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` }], isError: true };
      }

    case 'get_project_ticket_breakdown':
      try {
        const params = args as { worklogs: any[]; issues: Record<string, any> };
        const result = getProjectTicketBreakdown(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` }], isError: true };
      }

    case 'get_team_availability':
      try {
        const params = args as {
          from: string;
          to: string;
          userId?: string;
        };
        
        const result = await getTeamAvailability(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
            },
          ],
          isError: true,
        };
      }

    case 'get_project_insights':
      try {
        const params = args as {
          from: string;
          to: string;
        };
        
        const result = await getProjectInsights(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
            },
          ],
          isError: true,
        };
      }

    default:
      throw new Error(`Tool ${name} not found`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Team Insights MCP Server running on stdio');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}