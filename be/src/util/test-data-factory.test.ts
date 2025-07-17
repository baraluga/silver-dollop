import { TestDataFactory } from './test-data-factory';
import { TempoUser, TempoPlan, TempoWorklog } from '../types/tempo.interfaces';

describe('TestDataFactory', () => {
  describe('createTempoUser', () => {
    it('should create a default TempoUser', () => {
      const user = TestDataFactory.createTempoUser();
      
      expect(user).toEqual({
        accountId: 'user1',
        displayName: 'John Doe'
      });
    });

    it('should create a TempoUser with overrides', () => {
      const overrides: Partial<TempoUser> = {
        accountId: 'custom-user',
        displayName: 'Custom User'
      };
      
      const user = TestDataFactory.createTempoUser(overrides);
      
      expect(user).toEqual({
        accountId: 'custom-user',
        displayName: 'Custom User'
      });
    });

    it('should create a TempoUser with partial overrides', () => {
      const overrides: Partial<TempoUser> = {
        accountId: 'partial-user'
      };
      
      const user = TestDataFactory.createTempoUser(overrides);
      
      expect(user).toEqual({
        accountId: 'partial-user',
        displayName: 'John Doe'
      });
    });
  });

  describe('createTempoPlan', () => {
    it('should create a default TempoPlan', () => {
      const plan = TestDataFactory.createTempoPlan();
      
      expect(plan).toEqual({
        id: '1',
        assignee: {
          accountId: 'user1',
          displayName: 'John Doe'
        },
        totalPlannedSecondsInScope: 28800,
        startDate: '2024-01-01',
        endDate: '2024-01-01'
      });
    });

    it('should create a TempoPlan with overrides', () => {
      const overrides: Partial<TempoPlan> = {
        id: 'custom-plan',
        totalPlannedSecondsInScope: 14400,
        startDate: '2024-02-01',
        endDate: '2024-02-01'
      };
      
      const plan = TestDataFactory.createTempoPlan(overrides);
      
      expect(plan).toEqual({
        id: 'custom-plan',
        assignee: {
          accountId: 'user1',
          displayName: 'John Doe'
        },
        totalPlannedSecondsInScope: 14400,
        startDate: '2024-02-01',
        endDate: '2024-02-01'
      });
    });

    it('should create a TempoPlan with custom assignee', () => {
      const customUser: TempoUser = {
        accountId: 'custom-assignee',
        displayName: 'Custom Assignee'
      };
      
      const overrides: Partial<TempoPlan> = {
        assignee: customUser
      };
      
      const plan = TestDataFactory.createTempoPlan(overrides);
      
      expect(plan.assignee).toEqual(customUser);
      expect(plan.id).toBe('1');
    });
  });

  describe('createTempoWorklog', () => {
    it('should create a default TempoWorklog', () => {
      const worklog = TestDataFactory.createTempoWorklog();
      
      expect(worklog).toEqual({
        id: '1',
        author: {
          accountId: 'user1',
          displayName: 'John Doe'
        },
        timeSpentSeconds: 21600,
        billableSeconds: 21600,
        startDate: '2024-01-01',
        description: 'Work done'
      });
    });

    it('should create a TempoWorklog with overrides', () => {
      const overrides: Partial<TempoWorklog> = {
        id: 'custom-worklog',
        timeSpentSeconds: 14400,
        billableSeconds: 7200,
        startDate: '2024-02-01',
        description: 'Custom work'
      };
      
      const worklog = TestDataFactory.createTempoWorklog(overrides);
      
      expect(worklog).toEqual({
        id: 'custom-worklog',
        author: {
          accountId: 'user1',
          displayName: 'John Doe'
        },
        timeSpentSeconds: 14400,
        billableSeconds: 7200,
        startDate: '2024-02-01',
        description: 'Custom work'
      });
    });

    it('should create a TempoWorklog with custom author', () => {
      const customAuthor: TempoUser = {
        accountId: 'custom-author',
        displayName: 'Custom Author'
      };
      
      const overrides: Partial<TempoWorklog> = {
        author: customAuthor
      };
      
      const worklog = TestDataFactory.createTempoWorklog(overrides);
      
      expect(worklog.author).toEqual(customAuthor);
      expect(worklog.id).toBe('1');
    });
  });

  describe('createMultiplePlans', () => {
    it('should create multiple plans with default user prefix', () => {
      const plans = TestDataFactory.createMultiplePlans(3);
      
      expect(plans).toHaveLength(3);
      
      expect(plans[0]).toEqual({
        id: '1',
        assignee: {
          accountId: 'user1',
          displayName: 'User 1'
        },
        totalPlannedSecondsInScope: 28800,
        startDate: '2024-01-01',
        endDate: '2024-01-01'
      });
      
      expect(plans[1]).toEqual({
        id: '2',
        assignee: {
          accountId: 'user2',
          displayName: 'User 2'
        },
        totalPlannedSecondsInScope: 28800,
        startDate: '2024-01-01',
        endDate: '2024-01-01'
      });
      
      expect(plans[2]).toEqual({
        id: '3',
        assignee: {
          accountId: 'user3',
          displayName: 'User 3'
        },
        totalPlannedSecondsInScope: 28800,
        startDate: '2024-01-01',
        endDate: '2024-01-01'
      });
    });

    it('should create multiple plans with custom user prefix', () => {
      const plans = TestDataFactory.createMultiplePlans(2, 'dev');
      
      expect(plans).toHaveLength(2);
      
      expect(plans[0].assignee).toEqual({
        accountId: 'dev1',
        displayName: 'User 1'
      });
      
      expect(plans[1].assignee).toEqual({
        accountId: 'dev2',
        displayName: 'User 2'
      });
    });

    it('should create zero plans when count is 0', () => {
      const plans = TestDataFactory.createMultiplePlans(0);
      
      expect(plans).toHaveLength(0);
      expect(plans).toEqual([]);
    });

    it('should create single plan when count is 1', () => {
      const plans = TestDataFactory.createMultiplePlans(1);
      
      expect(plans).toHaveLength(1);
      expect(plans[0].id).toBe('1');
      expect(plans[0].assignee.accountId).toBe('user1');
    });
  });

  describe('createMultipleWorklogs', () => {
    it('should create multiple worklogs with default user prefix', () => {
      const worklogs = TestDataFactory.createMultipleWorklogs(3);
      
      expect(worklogs).toHaveLength(3);
      
      expect(worklogs[0]).toEqual({
        id: '1',
        author: {
          accountId: 'user1',
          displayName: 'User 1'
        },
        timeSpentSeconds: 21600,
        billableSeconds: 21600,
        startDate: '2024-01-01',
        description: 'Work done'
      });
      
      expect(worklogs[1]).toEqual({
        id: '2',
        author: {
          accountId: 'user2',
          displayName: 'User 2'
        },
        timeSpentSeconds: 21600,
        billableSeconds: 21600,
        startDate: '2024-01-01',
        description: 'Work done'
      });
      
      expect(worklogs[2]).toEqual({
        id: '3',
        author: {
          accountId: 'user3',
          displayName: 'User 3'
        },
        timeSpentSeconds: 21600,
        billableSeconds: 21600,
        startDate: '2024-01-01',
        description: 'Work done'
      });
    });

    it('should create multiple worklogs with custom user prefix', () => {
      const worklogs = TestDataFactory.createMultipleWorklogs(2, 'dev');
      
      expect(worklogs).toHaveLength(2);
      
      expect(worklogs[0].author).toEqual({
        accountId: 'dev1',
        displayName: 'User 1'
      });
      
      expect(worklogs[1].author).toEqual({
        accountId: 'dev2',
        displayName: 'User 2'
      });
    });

    it('should create zero worklogs when count is 0', () => {
      const worklogs = TestDataFactory.createMultipleWorklogs(0);
      
      expect(worklogs).toHaveLength(0);
      expect(worklogs).toEqual([]);
    });

    it('should create single worklog when count is 1', () => {
      const worklogs = TestDataFactory.createMultipleWorklogs(1);
      
      expect(worklogs).toHaveLength(1);
      expect(worklogs[0].id).toBe('1');
      expect(worklogs[0].author.accountId).toBe('user1');
    });
  });
});