# Team Resource Management System

## Project Overview

This project integrates Jira and GenAI capabilities with Tempo (time tracking) to provide automated insights into team resource management. Building upon the Hackathon's Jira + GenAI integration, this system will analyze team availability and billability to support better project planning and resource allocation decisions.

## Core Objectives

1. **Availability Analysis**: Determine team member availability based on Tempo Planner data
2. **Billability Tracking**: Calculate and analyze member billability metrics from Tempo time logs
3. **AI-Powered Insights**: Leverage GenAI to provide intelligent recommendations for resource allocation

## Technical Stack

- **Backend**: Located in `be/` directory
- **Frontend**: Located in `fe/` directory  
- **MCP Integration**: Model Context Protocol for AI agent capabilities
- **APIs**: Jira API, Tempo API
- **AI**: GenAI integration for analysis and recommendations

## Key Features

### 1. Tempo Planner Integration
- **Availability Tracking**: Pull team member schedules and planned allocations
- **Capacity Analysis**: Calculate available hours vs. planned work
- **Conflict Detection**: Identify scheduling conflicts and over-allocations
- **Timeline Visualization**: Display team availability across time periods

### 2. Tempo Logs Analysis
- **Billability Metrics**: Calculate billable vs. non-billable hours per team member
- **Project Distribution**: Analyze time allocation across projects and clients
- **Efficiency Tracking**: Monitor actual vs. planned time spent
- **Reporting**: Generate billability reports by team member, project, or time period

### 3. AI-Powered Recommendations
- **Resource Optimization**: Suggest optimal team member assignments
- **Workload Balancing**: Identify over/under-utilized team members
- **Project Forecasting**: Predict project completion based on current velocity
- **Risk Assessment**: Flag potential delivery risks based on availability

## Data Sources

### Jira Integration
- Project data and requirements
- Issue tracking and progress
- Team assignments and workloads

### Tempo Integration
- **Planner Data**: 
  - Team member schedules
  - Planned allocations
  - Availability windows
  - Vacation/PTO schedules
  
- **Time Logs Data**:
  - Actual hours logged
  - Billable/non-billable categorization
  - Project/client associations
  - Time entry descriptions

## Requirements

### Functional Requirements

#### Availability Management
- [ ] Import team schedules from Tempo Planner
- [ ] Calculate real-time availability for each team member
- [ ] Handle different allocation types (full-time, part-time, contractor)
- [ ] Account for holidays, PTO, and other non-working time
- [ ] Provide availability forecasting for future periods

#### Billability Analysis
- [ ] Import time logs from Tempo
- [ ] Categorize time as billable vs. non-billable
- [ ] Calculate billability percentages by team member
- [ ] Track billability trends over time
- [ ] Generate utilization reports

#### AI Integration
- [ ] Implement MCP for AI agent communication
- [ ] Develop prompts for resource analysis
- [ ] Generate natural language insights
- [ ] Provide actionable recommendations
- [ ] Support conversational queries about team metrics

### Technical Requirements

#### API Integration
- [ ] Secure connection to Jira API using existing credentials
- [ ] Secure connection to Tempo API using existing credentials
- [ ] Handle API rate limiting and error scenarios
- [ ] Implement data caching for performance

#### Data Processing
- [ ] Real-time data synchronization
- [ ] Data validation and cleansing
- [ ] Historical data analysis capabilities
- [ ] Export functionality for reports

#### Security & Compliance
- [ ] Secure credential management (already configured in .env)
- [ ] Data privacy compliance
- [ ] Audit logging for data access
- [ ] Role-based access control

## Success Metrics

1. **Accuracy**: Availability predictions vs. actual capacity utilization
2. **Efficiency**: Improved billability ratios across the team
3. **Adoption**: Regular usage by project managers and team leads
4. **Insights**: Quality and actionability of AI-generated recommendations

## Technical Architecture

### Backend Services
- **Tempo Integration Service**: Handle Planner and Time Logs APIs
- **Jira Integration Service**: Project and issue data management
- **Analysis Engine**: Calculate availability and billability metrics
- **MCP Server**: AI agent communication layer
- **API Gateway**: Unified endpoint for frontend consumption

### Frontend Components
- **Dashboard**: Overview of team availability and billability
- **Team View**: Individual member details and schedules
- **Reports**: Customizable analytics and exports
- **AI Chat Interface**: Natural language queries and insights

### Data Flow
1. **Ingestion**: Pull data from Tempo Planner and Time Logs APIs
2. **Processing**: Calculate metrics and identify patterns
3. **Analysis**: Apply AI models for insights and recommendations
4. **Presentation**: Display results through web interface and chat

## Environment Configuration

The project uses the following pre-configured API credentials:
- **Jira**: Base URL, email, API token, and base64 auth
- **Tempo**: API token, client ID, and client secret

## Next Steps

1. Set up MCP server architecture
2. Implement Tempo API integration for both Planner and Time Logs
3. Develop core availability and billability calculation engines
4. Create AI prompts and analysis workflows
5. Build frontend dashboard and reporting interface
6. Test with real team data and iterate based on feedback

## Development Notes

- Follow the coding guidelines in CLAUDE.md
- Maintain micro-commits for better git history
- Prioritize security for API credentials and team data
- Ensure scalability for multiple teams/projects
- Plan for incremental feature delivery