/* eslint-disable @typescript-eslint/no-explicit-any */

import { ToolHandlers } from "./tool-handlers";

export class ToolDispatcher {
  private handlers: ToolHandlers;

  constructor(services: any) {
    this.handlers = new ToolHandlers(services);
  }

  async dispatch(name: string, args: any = {}) {
    return this.dispatchCore(name, args);
  }

  private async dispatchCore(name: string, args: any) {
    if (name === "get_myself") {
      return this.handlers.handleGetMyself();
    }
    
    if (name === "generate_team_insights") {
      return this.handlers.handleGenerateInsights(args);
    }
    
    return this.dispatchData(name, args);
  }

  private async dispatchData(name: string, args: any) {
    if (name === "get_team_availability") {
      return this.handlers.handleGetTeamAvailability(args);
    }
    
    if (name === "get_team_billability") {
      return this.handlers.handleGetTeamBillability(args);
    }
    
    return this.dispatchUtility(name, args);
  }

  private async dispatchUtility(name: string, args: any) {
    if (name === "get_project_insights") {
      return this.handlers.handleGetProjectInsights(args);
    }
    
    return this.dispatchMisc(name, args);
  }

  private async dispatchMisc(name: string, args: any) {
    if (name === "list_team_members") {
      return this.handlers.handleListTeamMembers();
    }
    
    if (name === "get_user_details") {
      return this.handlers.handleGetUserDetails(args);
    }
    
    if (name === "parse_date_query") {
      return this.handlers.handleParseDateQuery(args);
    }
    
    throw new Error(`Unknown tool: ${name}`);
  }
}