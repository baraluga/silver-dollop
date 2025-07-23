#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import { getAllToolDefinitions } from "./tool-definitions";
import { ToolDispatcher } from "./tool-dispatcher";

interface MCPModules {
  Server: any;
  StdioServerTransport: any;
  CallToolRequestSchema: any;
  ListToolsRequestSchema: any;
}

interface ToolRequest {
  params: {
    name: string;
    arguments?: any;
  };
}

async function importMCPModules(): Promise<MCPModules> {
  const { Server } = await import("@modelcontextprotocol/sdk/server/index.js");
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
  const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
  } = await import("@modelcontextprotocol/sdk/types.js");

  return {
    Server,
    StdioServerTransport,
    CallToolRequestSchema,
    ListToolsRequestSchema,
  };
}

function createServices() {
  const { JiraService } = require("../services/jira.service");
  const { processQueryWithAI } = require("../services/aiInsightStrategy");
  const { teamDataService } = require("../services/team-data.service");
  const { ProjectInsightsService } = require("../services/project-insights.service");
  const { DateParsingService } = require("../services/date-parsing.service");
  
  return {
    jiraService: new JiraService(),
    processQueryWithAI,
    teamDataService,
    projectInsightsService: new ProjectInsightsService(),
    dateParsingService: new DateParsingService(),
  };
}

function createServer(modules: MCPModules) {
  return new modules.Server(
    {
      name: "jira-tempo-mcp-server",
      version: "2.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
}

function setupToolsList(server: any, modules: MCPModules) {
  server.setRequestHandler(modules.ListToolsRequestSchema, async () => {
    return {
      tools: getAllToolDefinitions(),
    };
  });
}

function handleError(error: unknown, operation: string) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [
      {
        type: "text",
        text: `Error during ${operation}: ${message}`,
      },
    ],
    isError: true,
  };
}

function setupToolHandlers(serverConfig: { server: any; modules: MCPModules; dispatcher: ToolDispatcher }) {
  const { server, modules, dispatcher } = serverConfig;
  server.setRequestHandler(modules.CallToolRequestSchema, async (request: ToolRequest) => {
    const { name, arguments: args = {} } = request.params;

    try {
      return await dispatcher.dispatch(name, args);
    } catch (error) {
      return handleError(error, name);
    }
  });
}

async function startServer(server: any, modules: MCPModules) {
  const transport = new modules.StdioServerTransport();
  await server.connect(transport);
  console.error("Jira/Tempo MCP server running on stdio with comprehensive insights");
}

async function createMCPServer() {
  const modules = await importMCPModules();
  const services = createServices();
  const dispatcher = new ToolDispatcher(services);
  const server = createServer(modules);
  
  setupToolsList(server, modules);
  setupToolHandlers({ server, modules, dispatcher });
  await startServer(server, modules);
}

createMCPServer().catch((error: unknown) => {
  console.error("Server error:", error);
  process.exit(1);
});