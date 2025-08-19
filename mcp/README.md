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

### Atomic tools

- `get_tempo_worklogs`
  - Purpose: Retrieve raw worklog data from Tempo
  - Params: `{ from: string; to: string; userId?: string }`
  - Returns: Tempo worklog array

- `get_tempo_plans`
  - Purpose: Retrieve raw plan data from Tempo
  - Params: `{ from: string; to: string; userId?: string }`
  - Returns: Tempo plan array

- `get_jira_users`
  - Purpose: Map Jira account IDs to display names
  - Params: `{ accountIds: string[] }`
  - Returns: `{ [accountId]: displayName }`

- `get_jira_issues`
  - Purpose: Get issue details for IDs
  - Params: `{ issueIds: string[] }`
  - Returns: `{ [issueId]: { key, summary, project: { key, name } } }`

- `calculate_billability`
  - Purpose: Calculate billability percentages from worklogs
  - Params: `{ worklogs: TempoWorklog[]; users?: Record<string,string> }`
  - Returns: Team/user billability metrics

- `calculate_availability`
  - Purpose: Calculate planned vs actual availability
  - Params: `{ plans: TempoPlan[]; worklogs: TempoWorklog[]; users?: Record<string,string> }`
  - Returns: Team/user availability metrics

- `analyze_project_distribution`
  - Purpose: Time distribution across projects
  - Params: `{ worklogs: TempoWorklog[]; issues?: IssueMap }`
  - Returns: `{ distribution: { projectKey, projectName, hours, billableHours }[] }`

- `get_user_ticket_work`
  - Purpose: Per-user breakdown of ticket work with context
  - Params: `{ worklogs: TempoWorklog[]; issues: IssueMap }`
  - Returns: `{ [userId]: UserTicketWork[] }`

- `get_project_ticket_breakdown`
  - Purpose: Per-project ticket breakdown with hours/percentages
  - Params: `{ worklogs: TempoWorklog[]; issues: IssueMap }`
  - Returns: `{ projectKey, projectName, tickets: { key, summary, hours, billableHours }[] }[]`

## Example flows

- Who worked on PLEXOS last week?
  1. `get_tempo_worklogs({ from, to })`
  2. Extract unique `issueIds`
  3. `get_jira_issues({ issueIds })`
  4. `get_user_ticket_work({ worklogs, issues })`
  5. Client filters by ticket summary containing "PLEXOS"

- What's our team billability this week?
  1. `get_tempo_worklogs({ from, to })`
  2. `calculate_billability({ worklogs })`

- Who's planned for DM-742 this week?
  1. `get_tempo_plans({ from, to })`
  2. Extract unique `issueIds`
  3. `get_jira_issues({ issueIds })`
  4. Client searches for issue key "DM-742"

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