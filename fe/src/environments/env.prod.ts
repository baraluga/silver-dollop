export const env = {
  production: true,
  apiUrl: 'https://api.example.com', // Set via build-time replacement or environment
  apiEndpoints: {
    insights: '/api/insights',
    health: '/health'
  }
};