import { TempoService } from './tempo.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TempoService', () => {
  let service: TempoService;

  beforeEach(() => {
    service = new TempoService();
    jest.clearAllMocks();
  });

  describe('getPlans', () => {
    it('should fetch plans with authentication', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 'plan1',
              user: { accountId: 'user1', displayName: 'John' },
              plannedSeconds: 28800,
              startDate: '2024-01-01',
              endDate: '2024-01-01'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getPlans('2024-01-01', '2024-01-31');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.tempo.io/4/plans',
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEMPO_API_TOKEN}`
          },
          params: {
            from: '2024-01-01',
            to: '2024-01-31'
          }
        }
      );
      expect(result).toEqual(mockResponse.data.results);
    });
  });

  describe('getWorklogs', () => {
    it('should fetch worklogs with authentication', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 'worklog1',
              user: { accountId: 'user1', displayName: 'John' },
              timeSpentSeconds: 3600,
              billableSeconds: 3600,
              startDate: '2024-01-01',
              description: 'Work'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getWorklogs('2024-01-01', '2024-01-31');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.tempo.io/4/worklogs',
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEMPO_API_TOKEN}`
          },
          params: {
            from: '2024-01-01',
            to: '2024-01-31'
          }
        }
      );
      expect(result).toEqual(mockResponse.data.results);
    });
  });
});