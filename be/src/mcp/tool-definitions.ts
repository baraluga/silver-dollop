/* eslint-disable max-lines-per-function */
export function getBasicToolDefinitions() {
  return [
    {
      name: "get_myself",
      description: "Get current Jira user information (myself endpoint)",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "generate_team_insights",
      description: "Generate AI-powered insights for team performance based on natural language queries",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Natural language query about team performance (e.g. 'who is the highest billable member yesterday?')",
            minLength: 1,
            maxLength: 500,
          },
        },
        required: ["query"],
      },
    },
    {
      name: "parse_date_query",
      description: "Parse natural language date expressions into date ranges",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Natural language date expression (e.g. 'last week', 'yesterday', 'next sprint')",
          },
        },
        required: ["query"],
      },
    },
  ];
}

export function getDataToolDefinitions() {
  return [
    {
      name: "get_team_availability",
      description: "Get team availability metrics for a specific period",
      inputSchema: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "Start date in YYYY-MM-DD format (defaults to current week)",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          },
          to: {
            type: "string",
            description: "End date in YYYY-MM-DD format (defaults to current week)",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          },
          userId: {
            type: "string",
            description: "Optional: Get availability for specific user only",
          },
        },
        required: [],
      },
    },
    {
      name: "get_team_billability",
      description: "Get team billability metrics and trends for a specific period",
      inputSchema: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "Start date in YYYY-MM-DD format (defaults to current week)",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          },
          to: {
            type: "string",
            description: "End date in YYYY-MM-DD format (defaults to current week)",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          },
          userId: {
            type: "string",
            description: "Optional: Get billability for specific user only",
          },
        },
        required: [],
      },
    },
    {
      name: "get_project_insights",
      description: "Get project allocation and resource distribution insights",
      inputSchema: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "Start date in YYYY-MM-DD format (defaults to current week)",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          },
          to: {
            type: "string",
            description: "End date in YYYY-MM-DD format (defaults to current week)",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          },
        },
        required: [],
      },
    },
    {
      name: "list_team_members",
      description: "Get list of all team members with their user IDs and display names",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "get_user_details",
      description: "Get detailed information for a specific user by their account ID",
      inputSchema: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The Jira account ID of the user to get details for",
          },
        },
        required: ["userId"],
      },
    },
  ];
}

export function getAllToolDefinitions() {
  return [
    ...getBasicToolDefinitions(),
    ...getDataToolDefinitions(),
  ];
}