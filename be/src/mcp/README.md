# Jira/Tempo MCP Server

This MCP server provides comprehensive team insights and analytics through integration with Jira and Tempo APIs for Claude Desktop and other MCP clients. It replicates the full functionality of the web application's insight system.

## Features

This MCP server provides comprehensive team insights and analytics through the following tools:

### Core Insight Tools
- **generate_team_insights()**: AI-powered natural language insights about team performance
- **get_team_availability()**: Team and individual availability metrics 
- **get_team_billability()**: Billability analysis with trends and targets
- **get_project_insights()**: Project allocation and resource distribution

### Data Access Tools
- **list_team_members()**: Team roster with user IDs and names
- **get_myself()**: Current Jira user information

### Utility Tools
- **parse_date_query()**: Parse natural language date expressions

## Setup

### 1. Environment Variables

Make sure your `.env` file has the required Jira credentials:

```
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_AUTH_64=your_base64_encoded_auth_string_here
AI_PROVIDER=BEDROCK
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "jira-tempo": {
      "command": "node",
      "args": ["/Users/qn5792/repos/silver-dollop/be/dist/mcp/server.js"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your.email@company.com",
        "JIRA_API_TOKEN": "your_jira_api_token_here",
        "JIRA_AUTH_64": "your_base64_encoded_auth_string_here",
        "AI_PROVIDER": "BEDROCK",
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "your_aws_access_key",
        "AWS_SECRET_ACCESS_KEY": "your_aws_secret_key"
      }
    }
  }
}
```

### 4. Build and Run

```bash
# Build and test the MCP server (builds automatically)
npm run mcp
```

The `npm run mcp` command will automatically build the project and start the server.

## Available Tools

### generate_team_insights(query)

Generate AI-powered insights for team performance based on natural language queries. This is the main tool that replicates the web app's insight functionality.

**Parameters**:
- `query` (string, required): Natural language query about team performance
  - Example: "who is the highest billable member yesterday?"
  - Example: "show me availability trends for last week"
  - Example: "which project consumed the most resources?"

**Returns**: JSON object with AI-generated insights:
- `title`: Summary title
- `summary`: Executive summary 
- `insights`: Array of specific insights
- `timestamp`: When the analysis was generated
- `thoughtProcess`: AI reasoning (optional)

### get_team_availability(from?, to?, userId?)

Get team availability metrics comparing planned vs actual hours.

**Parameters**:
- `from` (string, optional): Start date in YYYY-MM-DD format (defaults to current week)
- `to` (string, optional): End date in YYYY-MM-DD format (defaults to current week) 
- `userId` (string, optional): Get availability for specific user only

**Returns**: JSON object with availability data:
- `totalPlannedHours`: Total planned hours for the team
- `totalActualHours`: Total actual hours worked
- `teamAvailabilityPercentage`: Overall team availability percentage
- `userAvailabilities`: Array of individual user availability data

### get_team_billability(from?, to?, userId?)

Get team billability metrics and trends comparing actual vs ideal billability.

**Parameters**:
- `from` (string, optional): Start date in YYYY-MM-DD format (defaults to current week)
- `to` (string, optional): End date in YYYY-MM-DD format (defaults to current week)
- `userId` (string, optional): Get billability for specific user only

**Returns**: JSON object with billability analysis:
- `billability`: Team billability breakdown (total, billable, non-billable hours)
- `trend`: Billability trend analysis (actual vs ideal percentages, variance)
- `period`: Date range analyzed

### get_project_insights(from?, to?)

Get project allocation and resource distribution insights.

**Parameters**:
- `from` (string, optional): Start date in YYYY-MM-DD format (defaults to current week)
- `to` (string, optional): End date in YYYY-MM-DD format (defaults to current week)

**Returns**: JSON object with project analysis:
- `totalProjects`: Number of active projects
- `projectBreakdown`: Detailed breakdown of all projects with hours and percentages
- `topProjects`: Top 5 projects by time allocation
- `period`: Date range analyzed

### list_team_members()

Get list of all team members with their user IDs and display names.

**Parameters**: None

**Returns**: JSON object with team roster:
- `members`: Array of team members with userId and userName
- `totalMembers`: Count of team members

### get_myself()

Get information about the current Jira user.

**Parameters**: None

**Returns**: JSON object with user information:
- `accountId`: Jira account ID
- `displayName`: User's display name
- `emailAddress`: User's email
- `accountType`: Account type
- `active`: Active status
- `timeZone`: User's timezone
- `groups`: User groups
- `applicationRoles`: Application roles

### parse_date_query(query)

Parse natural language date expressions into date ranges.

**Parameters**:
- `query` (string, required): Natural language date expression
  - Example: "last week", "yesterday", "next sprint", "this month"

**Returns**: JSON object with parsed dates:
- `from`: Start date in YYYY-MM-DD format
- `to`: End date in YYYY-MM-DD format
- `originalQuery`: The original query string
- `error`: Error message if parsing failed (with fallback period)

## Usage in Claude Desktop

Once configured, you can ask Claude natural language questions and it will use the appropriate tools:

### Team Insights (Main Feature)
```
Who is the highest billable team member this week?
Show me availability trends for last week
Which project is consuming the most resources?
How is our team performing compared to targets?
```

### Specific Data Queries
```
What's the team availability for July 15-21?
Show me billability metrics for user 123abc
List all team members
Parse the date "next sprint"
```

### Complex Analysis
```
Generate insights about team performance trends
Analyze resource allocation across projects
Compare actual vs planned capacity utilization
```

Claude will automatically:
1. Use `generate_team_insights()` for complex analytical questions
2. Call specific data tools (`get_team_availability`, `get_team_billability`, etc.) for focused queries
3. Parse natural language dates and time periods
4. Provide comprehensive analysis combining multiple data sources

## Example Queries You Can Ask

- **"Who worked the most hours yesterday?"** → Uses `generate_team_insights()` with date parsing
- **"Show me team availability for last week"** → Uses `get_team_availability()` with parsed dates
- **"Which projects are we spending time on?"** → Uses `get_project_insights()`
- **"Is our billability on target?"** → Uses `get_team_billability()` with trend analysis
- **"Who's on the team?"** → Uses `list_team_members()`

The MCP server will automatically select and combine the appropriate tools to provide comprehensive insights, just like the original web application.