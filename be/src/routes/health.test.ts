import { buildServer } from '../server';
import { FastifyInstance } from 'fastify';

describe('Health Routes', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  it('should return health status with all API checks', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.body);
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('checks');
    
    expect(result.checks).toHaveProperty('backend');
    expect(result.checks).toHaveProperty('tempo');
    expect(result.checks).toHaveProperty('jira');
    
    expect(result.checks.backend.status).toBe('healthy');
    expect(['healthy', 'error']).toContain(result.checks.tempo.status);
    expect(['healthy', 'error']).toContain(result.checks.jira.status);
  });
});