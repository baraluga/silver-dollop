# Jira/Tempo MCP Server

This MCP server provides integration with Jira and Tempo APIs for Claude Desktop and other MCP clients.

## Features

- **get_myself()**: Get current Jira user information

## Setup

### 1. Environment Variables

Make sure your `.env` file has the required Jira credentials:

```
JIRA_BASE_URL=https://tractebel-et.atlassian.net
JIRA_EMAIL=brian.peralta@tractebel.engie.com
JIRA_API_TOKEN=ATATT3xFfGF03KiM2tzviVwqKG-Aa1hn53tBph2eEGfL6cWuDc28Rpz7RYR-XjqDNx0QPqf6xFAB_gtYn-krFWQY2UFUQoJCNMMwgxn7q42P-Jk0Eyx3aJDh9R2uMybIJjHD2ifYRYBeY36F5jBuuIVpzoYpLt176mHWvm7QpKHy-R-6Kykufjg=8E69CFF8
JIRA_AUTH_64=YnJpYW4ucGVyYWx0YUB0cmFjdGViZWwuZW5naWUuY29tOkFUQVRUM3hGZkdGMDNLaU0ydHp2aVZ3cUtHLUFhMWhuNTN0QnBoMmVFR2ZMNmNXdURjMjhScHo3UllSLVhqcUROeDBRUHFmNnhGQUJfZ3RZbi1rckZXUVkyVUZVUW9KQ05NTXdneG43cTQyUC1KazBFeXgzYUpEaDlSMnVNeWJJSmpIRDJpZllSWUJlWTM2RjVqQnV1SVZwem9ZcEx0MTc2bUhXdm03UXBLSHktUi02S3lrdWZqZz04RTY5Q0ZGOA==
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
        "JIRA_BASE_URL": "your_jira_base_url",
        "JIRA_EMAIL": "your_jira_email",
        "JIRA_API_TOKEN": "your_api_token",
        "JIRA_AUTH_64": "your_auth_64_encoded_string"
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

### get_myself()

Gets information about the current Jira user.

**Parameters**: None

**Returns**: JSON object with user information including:

- accountId
- displayName
- emailAddress
- accountType
- active status
- timeZone
- groups
- applicationRoles

## Usage in Claude Desktop

Once configured, you can use the tools in Claude Desktop:

```
Can you get my Jira user information?
```

Claude will use the `get_myself()` tool to fetch your current user data from Jira.
