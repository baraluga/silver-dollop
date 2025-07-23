/* eslint-disable @typescript-eslint/no-explicit-any */

export class ToolHandlers {
  constructor(private services: any) {}

  async handleGetMyself() {
    const userData = await this.services.jiraService.getUserData();
    return this.createResponse(userData);
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
    
    // Get unique user IDs from both availability and billability data
    const userIds = new Set<string>();
    teamData.availability.userAvailabilities.forEach((user: any) => {
      userIds.add(user.userId);
    });
    teamData.billability.userBillabilities.forEach((user: any) => {
      userIds.add(user.userId);
    });
    
    // Get detailed user info from Jira for each user
    const members = [];
    for (const userId of userIds) {
      try {
        const userDetails = await this.services.jiraService.getUsersByAccountIds([userId]);
        if (userDetails && userDetails.length > 0) {
          const user = userDetails[0];
          members.push({
            userId: user.accountId,
            userName: user.displayName,
            email: user.emailAddress,
            active: user.active,
          });
        } else {
          // Fallback to availability data if Jira lookup fails
          const availUser = teamData.availability.userAvailabilities.find((u: any) => u.userId === userId);
          members.push({
            userId: userId,
            userName: availUser?.userName || userId,
            email: null,
            active: true,
          });
        }
      } catch (error) {
        // Fallback for failed lookups
        const availUser = teamData.availability.userAvailabilities.find((u: any) => u.userId === userId);
        members.push({
          userId: userId,
          userName: availUser?.userName || userId,
          email: null,
          active: true,
        });
      }
    }
    
    return this.createResponse({ 
      members: members.sort((a, b) => a.userName.localeCompare(b.userName)),
      totalMembers: members.length 
    });
  }

  async handleGetUserDetails(args: any) {
    const { userId } = args;
    
    try {
      const userDetails = await this.services.jiraService.getUsersByAccountIds([userId]);
      if (userDetails && userDetails.length > 0) {
        return this.createResponse(userDetails[0]);
      } else {
        throw new Error(`User with ID ${userId} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to get user details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async handleGetRawWorklogs(args: any) {
    const period = this.getPeriodFromArgs(args);
    const teamData = await this.services.teamDataService.getTeamInsights(period);
    
    let worklogs = teamData.worklogs;
    
    // Filter by user if specified
    if (args.userId) {
      worklogs = worklogs.filter((worklog: any) => 
        worklog.worker && worklog.worker.accountId === args.userId
      );
    }
    
    // Return raw worklogs with essential fields
    const rawWorklogs = worklogs.map((worklog: any) => ({
      id: worklog.id,
      startDate: worklog.startDate,
      timeSpentSeconds: worklog.timeSpentSeconds,
      timeSpentHours: Math.round(worklog.timeSpentSeconds / 3600 * 100) / 100,
      billableSeconds: worklog.billableSeconds,
      billableHours: Math.round(worklog.billableSeconds / 3600 * 100) / 100,
      worker: {
        accountId: worklog.worker?.accountId,
        displayName: worklog.worker?.displayName,
      },
      issue: {
        key: worklog.issue?.key,
        summary: worklog.issue?.summary,
      },
      projectKey: worklog.projectKey,
      projectName: worklog.projectName,
      description: worklog.description,
    }));
    
    return this.createResponse({
      worklogs: rawWorklogs,
      totalWorklogs: rawWorklogs.length,
      period: period,
      totalHours: Math.round(rawWorklogs.reduce((sum: number, w: any) => sum + w.timeSpentHours, 0) * 100) / 100,
      totalBillableHours: Math.round(rawWorklogs.reduce((sum: number, w: any) => sum + w.billableHours, 0) * 100) / 100,
    });
  }

  async handleGetTempoPlans(args: any) {
    const period = this.getPeriodFromArgs(args);
    
    // Access Tempo service directly to get raw plans
    const { TempoService } = require("../services/tempo.service");
    const tempoService = new TempoService();
    
    const plans = await tempoService.getPlans(period.from, period.to);
    
    // Return raw plans with essential fields
    const rawPlans = plans.map((plan: any) => ({
      id: plan.id,
      startDate: plan.startDate,
      endDate: plan.endDate,
      totalPlannedSecondsInScope: plan.totalPlannedSecondsInScope,
      totalPlannedHours: Math.round(plan.totalPlannedSecondsInScope / 3600 * 100) / 100,
      assignee: {
        accountId: plan.assignee?.accountId,
        displayName: plan.assignee?.displayName,
      },
      planItem: {
        id: plan.planItem?.id,
        name: plan.planItem?.name,
        type: plan.planItem?.type,
      },
    }));
    
    return this.createResponse({
      plans: rawPlans,
      totalPlans: rawPlans.length,
      period: period,
      totalPlannedHours: Math.round(rawPlans.reduce((sum: number, p: any) => sum + p.totalPlannedHours, 0) * 100) / 100,
    });
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