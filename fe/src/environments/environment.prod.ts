export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://api.example.com',
  apiEndpoints: {
    insights: '/api/insights',
    health: '/health'
  }
};