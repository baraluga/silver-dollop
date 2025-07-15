import { JiraService } from './jira.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JiraService', () => {
  let service: JiraService;

  beforeEach(() => {
    service = new JiraService();
    jest.clearAllMocks();
    
    // Mock delay function
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      if (typeof fn === 'function') fn();
      return {} as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUser', () => {
    it('should fetch user by account ID', async () => {
      const mockUser = {
        accountId: 'user123',
        displayName: 'John Doe',
        emailAddress: 'john@example.com',
        avatarUrls: { '48x48': 'avatar.jpg' },
        active: true
      };

      mockedAxios.get.mockResolvedValue({ data: mockUser });

      const result = await service.getUser('user123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${process.env.JIRA_BASE_URL}/rest/api/3/user`,
        {
          headers: { 'Authorization': `Basic ${process.env.JIRA_AUTH_64}` },
          params: { accountId: 'user123' }
        }
      );
      expect(result).toEqual(mockUser);
    });

    it('should retry on rate limit error', async () => {
      const mockUser = {
        accountId: 'user123',
        displayName: 'John Doe',
        emailAddress: 'john@example.com',
        avatarUrls: { '48x48': 'avatar.jpg' },
        active: true
      };

      mockedAxios.get
        .mockRejectedValueOnce({ response: { status: 429 } })
        .mockResolvedValueOnce({ data: mockUser });

      const result = await service.getUser('user123');

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUser);
    });

    it('should fail after max retries', async () => {
      const error = { response: { status: 429 } };
      mockedAxios.get.mockRejectedValue(error);

      await expect(service.getUser('user123')).rejects.toEqual(error);
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('getUsersByAccountIds', () => {
    it('should fetch multiple users', async () => {
      const mockUsers = [
        {
          accountId: 'user1',
          displayName: 'John',
          emailAddress: 'john@example.com',
          avatarUrls: { '48x48': 'avatar1.jpg' },
          active: true
        },
        {
          accountId: 'user2',
          displayName: 'Jane',
          emailAddress: 'jane@example.com',
          avatarUrls: { '48x48': 'avatar2.jpg' },
          active: true
        }
      ];

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockUsers[0] })
        .mockResolvedValueOnce({ data: mockUsers[1] });

      const result = await service.getUsersByAccountIds(['user1', 'user2']);

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserData', () => {
    it('should return current user data', async () => {
      const mockUserData = { accountId: 'current123', displayName: 'Current User' };
      
      mockedAxios.get.mockResolvedValue({ data: mockUserData });
      
      const result = await service.getUserData();
      
      expect(result).toEqual(mockUserData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${process.env.JIRA_BASE_URL}/rest/api/3/myself`,
        { headers: { 'Authorization': `Basic ${process.env.JIRA_AUTH_64}` } }
      );
    });
  });
});