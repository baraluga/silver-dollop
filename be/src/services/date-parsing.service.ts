import * as chrono from 'chrono-node';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export class DateParsingService {
  parseQueryDate(query: string): DateRange | null {
    const parsed = chrono.parse(query, new Date(), { forwardDate: true });
    
    if (parsed.length === 0) {
      return null;
    }

    return this.buildDateRange(parsed[0]);
  }

  private buildDateRange(result: chrono.ParsedResult): DateRange {
    const startDate = result.start.date();
    const endDate = result.end?.date() || startDate;

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
}