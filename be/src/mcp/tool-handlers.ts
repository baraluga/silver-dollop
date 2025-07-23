/* eslint-disable @typescript-eslint/no-explicit-any */

export class ToolHandlers {
  constructor(private services: any) {}

  async handleGetMyself() {
    const userData = await this.services.jiraService.getUserData();
    return this.createResponse(userData);
  }

  async handleGenerateInsights(args: any) {
    const { query } = args;
    const result = await this.services.processQueryWithAI(query);
    return this.createResponse(result);
  }

  async handleGetTeamAvailability(args: any) {
    const period = this.getPeriodFromArgs(args);
    const teamData = await this.services.teamDataService.getTeamInsights(period);
    
    if (args.userId) {
      return this.handleGetUserAvailability(teamData, args.userId);
    }
    
    return this.createResponse(teamData.availability);
  }

  async handleGetTeamBillability(args: any) {
    const period = this.getPeriodFromArgs(args);
    const teamData = await this.services.teamDataService.getTeamInsights(period);
    
    if (args.userId) {
      return this.handleGetUserBillability(teamData, args.userId);
    }
    
    const result = {
      billability: teamData.billability,
      trend: teamData.trend,
      period: teamData.period,
    };
    
    return this.createResponse(result);
  }

  async handleGetProjectInsights(args: any) {
    const period = this.getPeriodFromArgs(args);
    const teamData = await this.services.teamDataService.getTeamInsights(period);
    const projectInsights = this.services.projectInsightsService.generateProjectInsights(teamData.worklogs);
    
    const result = {
      ...projectInsights,
      period: teamData.period,
    };
    
    return this.createResponse(result);
  }

  async handleListTeamMembers() {
    const period = this.getCurrentWeekPeriod();
    const teamData = await this.services.teamDataService.getTeamInsights(period);
    
    const members = teamData.availability.userAvailabilities.map((user: any) => ({
      userId: user.userId,
      userName: user.userName,
    }));
    
    return this.createResponse({ members, totalMembers: members.length });
  }

  async handleParseDateQuery(args: any) {
    const { query } = args;
    const parsedDate = this.services.dateParsingService.parseQueryDate(query);
    
    if (!parsedDate) {
      return this.createResponse({ 
        error: "Could not parse date query", 
        query,
        fallback: this.getCurrentWeekPeriod() 
      });
    }
    
    return this.createResponse({ 
      from: parsedDate.startDate, 
      to: parsedDate.endDate,
      originalQuery: query 
    });
  }

  private handleGetUserAvailability(teamData: any, userId: string) {
    const userAvailability = teamData.availability.userAvailabilities.find(
      (user: any) => user.userId === userId
    );
    if (!userAvailability) {
      throw new Error(`User ${userId} not found`);
    }
    return this.createResponse(userAvailability);
  }

  private handleGetUserBillability(teamData: any, userId: string) {
    const userBillability = teamData.billability.userBillabilities.find(
      (user: any) => user.userId === userId
    );
    if (!userBillability) {
      throw new Error(`User ${userId} not found`);
    }
    
    const result = {
      ...userBillability,
      trend: teamData.trend,
      period: teamData.period,
    };
    
    return this.createResponse(result);
  }

  private getPeriodFromArgs(args: any) {
    if (args.from && args.to) {
      return { from: args.from, to: args.to };
    }
    return this.getCurrentWeekPeriod();
  }

  private getCurrentWeekPeriod() {
    const now = new Date();
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      from: weekStart.toISOString().split("T")[0],
      to: weekEnd.toISOString().split("T")[0],
    };
  }

  private createResponse(data: any) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
}