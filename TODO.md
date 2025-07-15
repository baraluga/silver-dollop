# Team Resource Management System - MVP Tasks

## MVP Scope

Simple Angular application with TailwindCSS that allows users to query AI for team resource insights with template questions. Single page with query input and insight display.

## New Requirements

### Ideal Billability Ratio Constant

- [x] **Backend**: Define ideal billability ratio as a constant (e.g., 75%) in appropriate service/config
- [x] **Integration**: Use billability ratio constant as context in AI insights generation
- [x] **Implementation**: Reference this constant when generating billability analysis and recommendations

**Requirement**: The system should use a predefined "ideal billability ratio" constant as additional context when generating insights

✅ **COMPLETED**: Billability ratio constant (75%) is now implemented and integrated into AI insights generation.


### 9. Data Processing Engine (Post-Mock Implementation)

- [ ] Create availability calculation service
- [ ] Implement billability metrics calculator
- [ ] Build team data aggregation logic
- [ ] Add simple in-memory caching

### 10. AI Integration (Post-Mock Implementation)

- [ ] Set up OpenAI/Claude client
- [ ] Create prompt templates for resource insights
- [ ] Implement query processing logic
- [ ] Add natural language response generation

## Infrastructure & DevOps

### 14. Testing
- [ ] Add basic e2e testing setup


## MVP User Flow

1. User visits single page Angular application
2. User sees query textarea and two template question buttons
3. User clicks template question OR types custom query
4. User submits query
5. Frontend shows loading state
6. Backend returns realistic mock insights (initially)
7. Mock AI-generated insight appears below query area
8. User can submit new queries

## Development Strategy: Mock First

- **Phase 1**: Create mock `/api/insights` endpoint with realistic responses
- **Phase 2**: Build Angular frontend against mocks (parallel development)
- **Phase 3**: Implement real Tempo/Jira/AI integration
- **Phase 4**: Replace mocks with real data processing

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
│   ├── jira.service.ts (user data only)
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
- [ ] Backend successfully retrieves Tempo data and Jira user information
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
