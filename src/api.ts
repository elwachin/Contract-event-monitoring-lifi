import express, { Application } from 'express'
import cors from 'cors'
import { FeeCollectedEventModel } from './models/FeeCollectedEvent'

export function setupAPI(app: Application = express()): Application {
  const PORT = process.env.PORT || 5000

  app.use(cors())

  // Get events by integrator
  /* TODO: need to implement protection against DDoS attacks using something like ratelimit module. */
  app.get('/api/events/:integrator', async (req, res) => {
    try {
      const events = await FeeCollectedEventModel.find({
        integrator: req.params.integrator
      }).sort({ blockNumber: -1 })
      res.json(events)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch events' })
    }
  })

  // Only start the server if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`)
    })
  }

  return app
} 