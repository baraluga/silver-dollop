import { DateParsingService } from './date-parsing.service';

describe('DateParsingService', () => {
  let service: DateParsingService;

  beforeEach(() => {
    service = new DateParsingService();
  });

  it('should parse yesterday', () => {
    const result = service.parseQueryDate('yesterday');
    expect(result).not.toBeNull();
    expect(result?.startDate).toBeDefined();
    expect(result?.endDate).toBeDefined();
  });

  it('should parse last week', () => {
    const result = service.parseQueryDate('last week');
    expect(result).not.toBeNull();
    expect(result?.startDate).toBeDefined();
    expect(result?.endDate).toBeDefined();
  });

  it('should parse 2 months ago', () => {
    const result = service.parseQueryDate('2 months ago');
    expect(result).not.toBeNull();
    expect(result?.startDate).toBeDefined();
    expect(result?.endDate).toBeDefined();
  });

  it('should parse specific date', () => {
    const result = service.parseQueryDate('July 15, 2025');
    expect(result).not.toBeNull();
    expect(result?.startDate).toBe('2025-07-15');
    expect(result?.endDate).toBe('2025-07-15');
  });

  it('should return null for invalid input', () => {
    const result = service.parseQueryDate('invalid date string');
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = service.parseQueryDate('');
    expect(result).toBeNull();
  });

  it('should handle date ranges', () => {
    const result = service.parseQueryDate('from July 1 to July 5');
    expect(result).not.toBeNull();
    expect(result?.startDate).toBeDefined();
    expect(result?.endDate).toBeDefined();
  });
});