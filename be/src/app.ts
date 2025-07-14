import { buildServer } from './server'

export const start = async () => {
  try {
    const fastify = await buildServer()
    
    // Start server
    const port = parseInt(process.env.PORT || '3000')
    await fastify.listen({ port, host: '0.0.0.0' })
    
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  start()
}