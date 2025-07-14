# Team Resource Management System - MVP Tasks

## MVP Scope
Simple Angular application with TailwindCSS that allows users to query AI for team resource insights with template questions. Single page with query input and insight display.

## Frontend Tasks (Angular + TailwindCSS)

### 1. Project Setup
- [ ] Create Angular project structure in `fe/` directory
- [ ] Install and configure TailwindCSS
- [ ] Set up TypeScript configuration
- [ ] Configure Angular routing (single page for MVP)
- [ ] Set up environment configuration files

### 2. UI Components
- [ ] Create main layout component
- [ ] Build query input textarea component
- [ ] Create template question buttons component
- [ ] Design insight display component
- [ ] Add loading state indicators
- [ ] Implement responsive design with TailwindCSS

### 3. Template Questions
- [ ] Implement template question: "What is our team's current availability for the next sprint?"
- [ ] Implement template question: "Which team members have the highest billability this month?"
- [ ] Add click handlers to populate query textarea

### 4. API Integration
- [ ] Create Angular service for backend communication
- [ ] Implement HTTP client configuration
- [ ] Add error handling for API calls
- [ ] Create data models/interfaces for API responses

### 5. State Management
- [ ] Implement query state management
- [ ] Handle loading states
- [ ] Manage insight display state
- [ ] Add error state handling

## Backend Tasks (Fastify + TypeScript)

### 6. API Setup
- [ ] Create Fastify server in `be/` directory
- [ ] Set up TypeScript configuration for backend
- [ ] Configure CORS plugin for frontend communication
- [ ] Set up environment variables handling with @fastify/env

### 7. Tempo API Integration
- [ ] Implement Tempo Planner API client
- [ ] Implement Tempo Time Logs API client
- [ ] Add API authentication handling
- [ ] Create TypeScript interfaces for Tempo responses

### 8. Jira API Integration
- [ ] Implement Jira API client using existing credentials
- [ ] Add team member data retrieval
- [ ] Implement project data fetching
- [ ] Handle API rate limiting with simple retry logic

### 9. Data Processing Engine
- [ ] Create availability calculation service
- [ ] Implement billability metrics calculator
- [ ] Build team data aggregation logic
- [ ] Add simple in-memory caching

### 10. AI Integration (Direct API)
- [ ] Set up OpenAI/Claude client
- [ ] Create prompt templates for resource insights
- [ ] Implement query processing logic
- [ ] Add natural language response generation

### 11. API Endpoints
- [ ] Create `POST /api/insights` endpoint with JSON schema validation
- [ ] Implement query validation using Fastify schemas
- [ ] Add response formatting
- [ ] Include error handling and logging

## Infrastructure & DevOps

### 12. Development Environment
- [ ] Set up package.json for both fe/ and be/
- [ ] Configure development scripts (npm run dev)
- [ ] Set up concurrent development servers
- [ ] Add nodemon for backend hot reload

### 13. Security
- [ ] Implement secure credential management (.env files)
- [ ] Add input validation with Fastify schemas
- [ ] Configure rate limiting plugin
- [ ] Add basic CORS configuration

### 14. Testing
- [ ] Set up Jest for backend unit tests
- [ ] Set up Jasmine/Karma for frontend tests
- [ ] Create integration tests for API endpoints
- [ ] Add basic e2e testing setup

### 15. Deployment
- [ ] Configure build scripts for both apps
- [ ] Set up production environment variables
- [ ] Create deployment documentation
- [ ] Test deployment process

## MVP User Flow
1. User visits single page Angular application
2. User sees query textarea and two template question buttons
3. User clicks template question OR types custom query
4. User submits query
5. Frontend shows loading state
6. Backend fetches data from Tempo/Jira APIs
7. Backend sends data + query to AI for insight generation
8. AI-generated insight appears below query area
9. User can submit new queries

## Technical Architecture (MVP)

### Frontend (Angular)
```
src/
├── app/
│   ├── components/
│   │   ├── query-input/
│   │   ├── template-questions/
│   │   └── insight-display/
│   ├── services/
│   │   └── api.service.ts
│   └── models/
│       └── insight.interface.ts
```

### Backend (Fastify)
```
src/
├── plugins/
│   ├── cors.ts
│   └── env.ts
├── routes/
│   └── insights.ts
├── services/
│   ├── tempo.service.ts
│   ├── jira.service.ts
│   ├── ai.service.ts
│   └── data.service.ts
└── app.ts
```

## Dependencies

### Frontend
- Angular 17+
- TailwindCSS
- Angular HTTP Client
- RxJS

### Backend  
- Fastify 4+
- @fastify/cors
- @fastify/env
- @fastify/rate-limit
- openai (or @anthropic-ai/sdk)
- axios (for API calls)

## Success Criteria for MVP
- [ ] Application loads and displays correctly
- [ ] Template questions populate textarea when clicked
- [ ] Custom queries can be submitted
- [ ] Backend successfully retrieves Tempo/Jira data
- [ ] AI generates meaningful insights about team resources
- [ ] Insights display properly in the frontend
- [ ] Application handles errors gracefully
- [ ] Responsive design works on desktop and mobile
- [ ] Response time under 10 seconds for insights

## Future Enhancements (Post-MVP)
- Add MCP layer for advanced AI agent capabilities
- Multiple page navigation
- Historical data visualization
- Advanced filtering options
- Team member detail views
- Export functionality
- Real-time data updates
- WebSocket for live insights