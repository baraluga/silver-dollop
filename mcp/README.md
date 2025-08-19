# Team Insights MCP Server

A standalone MCP server that provides raw team billability data from Tempo and Jira APIs. This server provides data tools only - no AI processing is done server-side. The MCP client (like Claude Desktop) handles all analysis and insight generation.

## Architecture

This MCP server is completely independent from the `be/` and `fe/` directories. It implements its own:
- Tempo API integration for worklog data
- Jira API integration for user information
- Raw data processing and calculations (no AI/business logic)
- MCP server protocol implementation

**Design Philosophy**: Pure data provider - the server performs no date interpretation, business logic, or AI analysis. All intelligence is handled by the MCP client.

## Available Tools

### `get_team_billability`

Returns raw billability data for team analysis - answers "How billable is a person/team?"

**Parameters:**
- `from` (required): Start date in YYYY-MM-DD format
- `to` (required): End date in YYYY-MM-DD format  
- `userId` (optional): Specific user account ID (returns all users if not specified)

**Returns:**
```json
{
  "totalHours": 320.5,
  "billableHours": 280.25,
  "nonBillableHours": 40.25,
  "teamBillabilityPercentage": 87.44,
  "userBillabilities": [
    {
      "userId": "user123",
      "userName": "John Doe",
      "totalHours": 40.0,
      "billableHours": 35.0,
      "nonBillableHours": 5.0,
      "billabilityPercentage": 87.5
    }
  ],
  "period": {
    "from": "2025-01-13",
    "to": "2025-01-19"
  }
}
```

### `get_team_availability`

Returns planned vs actual hours data - answers "Who's most available for new work?"

**Parameters:**
- `from` (required): Start date in YYYY-MM-DD format
- `to` (required): End date in YYYY-MM-DD format  
- `userId` (optional): Specific user account ID (returns all users if not specified)

**Returns:**
```json
{
  "totalPlannedHours": 400.0,
  "totalActualHours": 350.5,
  "teamAvailabilityPercentage": 87.63,
  "userAvailabilities": [
    {
      "userId": "user123",
      "userName": "John Doe",
      "plannedHours": 40.0,
      "actualHours": 35.5,
      "availabilityPercentage": 88.75
    }
  ],
  "period": {
    "from": "2025-01-13",
    "to": "2025-01-19"
  }
}
```

### `get_project_insights`

Returns project-level time allocation and resource distribution.

**Parameters:**
- `from` (required): Start date in YYYY-MM-DD format
- `to` (required): End date in YYYY-MM-DD format

**Returns:**
```json
{
  "totalProjects": 5,
  "projectBreakdown": [
    {
      "projectKey": "PROJ",
      "projectName": "PROJ Project",
      "totalHours": 120.5,
      "billableHours": 100.25,
      "percentageOfTotal": 37.66
    }
  ],
  "topProjects": [
    {
      "projectKey": "PROJ",
      "projectName": "PROJ Project", 
      "totalHours": 120.5,
      "billableHours": 100.25,
      "percentageOfTotal": 37.66
    }
  ],
  "period": {
    "from": "2025-01-13",
    "to": "2025-01-19"
  }
}
```

## Setup

### 1. Install Dependencies

```bash
cd mcp
npm install
```

### 2. Environment Variables

Set these environment variables:

```bash
TEMPO_API_TOKEN=your_tempo_api_token
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_jira_api_token
```

### 3. Build the Server

```bash
npm run build
```

### 4. Test the Server

Basic test (requires valid API credentials):
```bash
npm start
```

For testing without credentials, see the included `test-client.js` and `manual-test.md` files.

### 5. Claude Desktop Configuration

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "team-insights": {
      "command": "node",
      "args": ["/Users/qn5792/repos/silver-dollop/mcp/dist/server.js"],
      "env": {
        "TEMPO_API_TOKEN": "your_tempo_api_token",
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your.email@company.com",
        "JIRA_API_TOKEN": "your_jira_api_token"
      }
    }
  }
}
```

## Usage in Claude Desktop

Once configured, you can ask Claude questions like:

**Billability Questions:**
- "What's our team billability this week?"
- "Who has the highest billable hours?"
- "Show me John's billability for last month"

**Availability Questions:**
- "Who's most available for new work this week?"
- "What's our team capacity utilization?"
- "Show me planned vs actual hours for the team"

**Project Questions:**
- "Which projects are consuming the most time?"
- "What's our time distribution across projects?"
- "Show me project resource allocation"

**Important**: Claude must provide specific date ranges. The server requires explicit `from` and `to` dates - it does not interpret relative dates like "this week" or "last month". The MCP client (Claude) handles date interpretation and passes exact dates to the tools.

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Start the server
npm start
```