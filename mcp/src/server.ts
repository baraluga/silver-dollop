#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getTeamBillability } from './tools/index.js';

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
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_team_billability':
      try {
        const params = args as {
          from?: string;
          to?: string;
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