#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-params */

interface MCPModules {
  Server: any;
  StdioServerTransport: any;
  CallToolRequestSchema: any;
  ListToolsRequestSchema: any;
}

interface ToolRequest {
  params: {
    name: string;
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

function createJiraService() {
  const { JiraService } = require("../services/jira.service");
  return new JiraService();
}

function createServer(modules: MCPModules) {
  return new modules.Server(
    {
      name: "jira-tempo-mcp-server",
      version: "1.0.0",
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
      tools: [
        {
          name: "get_myself",
          description: "Get current Jira user information (myself endpoint)",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      ],
    };
  });
}

async function handleGetMyself(jiraService: any) {
  const userData = await jiraService.getUserData();
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(userData, null, 2),
      },
    ],
  };
}

function handleError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [
      {
        type: "text",
        text: `Error getting user data: ${message}`,
      },
    ],
    isError: true,
  };
}

function setupToolHandlers(server: any, modules: MCPModules, jiraService: any) {
  server.setRequestHandler(modules.CallToolRequestSchema, async (request: ToolRequest) => {
    const { name } = request.params;

    if (name === "get_myself") {
      try {
        return await handleGetMyself(jiraService);
      } catch (error) {
        return handleError(error);
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  });
}

async function startServer(server: any, modules: MCPModules) {
  const transport = new modules.StdioServerTransport();
  await server.connect(transport);
  console.error("Jira/Tempo MCP server running on stdio");
}

async function createMCPServer() {
  const modules = await importMCPModules();
  const jiraService = createJiraService();
  const server = createServer(modules);
  
  setupToolsList(server, modules);
  setupToolHandlers(server, modules, jiraService);
  await startServer(server, modules);
}

createMCPServer().catch((error: unknown) => {
  console.error("Server error:", error);
  process.exit(1);
});