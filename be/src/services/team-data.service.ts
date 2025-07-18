import { TempoService } from "./tempo.service";
import {
  AvailabilityService,
  TeamAvailability,
  UserAvailability,
} from "./availability.service";
import {
  BillabilityService,
  TeamBillability,
  UserBillability,
  BillabilityTrend,
} from "./billability.service";
import { WorklogEnrichmentService } from "./worklog-enrichment.service";
import { TempoPlan, TempoWorklog } from "../types/tempo.interfaces";

interface TempoData {
  plans: TempoPlan[];
  worklogs: TempoWorklog[];
}

export interface TeamInsights {
  availability: TeamAvailability;
  billability: TeamBillability;
  trend: BillabilityTrend;
  worklogs: TempoWorklog[];
  period: {
    from: string;
    to: string;
  };
}

export interface UserInsights {
  availability: UserAvailability;
  billability: UserBillability;
  period: {
    from: string;
    to: string;
  };
}

export class TeamDataService {
  private worklogEnrichmentService = new WorklogEnrichmentService();

  constructor(
    private tempoService: TempoService,
    private services: {
      availability: AvailabilityService;
      billability: BillabilityService;
    },
  ) {}

  async getTeamInsights(period: {
    from: string;
    to: string;
  }): Promise<TeamInsights> {
    const data = await this.fetchTempoDataSafely(period.from, period.to);
    return this.buildTeamInsights(data, period);
  }

  async getUserInsights(
    userId: string,
    period: { from: string; to: string },
  ): Promise<UserInsights> {
    const data = await this.fetchTempoDataSafely(period.from, period.to);
    return this.buildUserInsights(userId, { data, period });
  }

  private buildTeamInsights(
    data: TempoData,
    period: { from: string; to: string },
  ): TeamInsights {
    return {
      availability: this.services.availability.calculateTeamAvailability(data),
      billability: this.services.billability.calculateTeamBillability(
        data.worklogs,
      ),
      trend: this.services.billability.analyzeBillabilityTrend(data.worklogs),
      worklogs: data.worklogs,
      period,
    };
  }

  private buildUserInsights(
    userId: string,
    params: { data: TempoData; period: { from: string; to: string } },
  ): UserInsights {
    return {
      availability: this.services.availability.calculateUserAvailability(
        userId,
        params.data,
      ),
      billability: this.services.billability.calculateUserBillability(
        userId,
        params.data.worklogs,
      ),
      period: params.period,
    };
  }

  private async fetchTempoDataSafely(
    from: string,
    to: string,
  ): Promise<TempoData> {
    return await this.fetchTempoData(from, to);
  }

  private async fetchTempoData(from: string, to: string): Promise<TempoData> {
    const [plans, rawWorklogs] = await Promise.all([
      this.tempoService.getPlans(from, to),
      this.tempoService.getWorklogs(from, to),
    ]);

    const enrichedWorklogs = await this.worklogEnrichmentService.enrichWorklogsWithProjects(rawWorklogs);

    return { plans, worklogs: enrichedWorklogs };
  }
}

export const teamDataService = new TeamDataService(new TempoService(), {
  availability: new AvailabilityService(),
  billability: new BillabilityService(),
});
