import request from 'supertest'
import express from 'express'
import { setupAPI } from '../api'
import { FeeCollectedEventModel } from '../models/FeeCollectedEvent'

// Mock FeeCollectedEventModel
jest.mock('../models/FeeCollectedEvent', () => ({
  FeeCollectedEventModel: {
    find: jest.fn()
  }
}));

process.env.NODE_ENV = 'test';

describe('API Endpoints', () => {
  let app: express.Application;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new Express app for each test
    app = express();
    setupAPI(app);
  });

  describe('GET /api/events/:integrator', () => {
    it('should return events for a valid integrator', async () => {
      const mockEvents = [
        {
          transactionHash: '0xbf909ad929152839fb8a7a4261be6cf95f29b07859898d6d5fd0e009e6002509',
          blockNumber: 61514701,
          integrator: '0x1Bcc58D165e5374D7B492B21c0a572Fd61C0C2a0',
          token: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          integratorFee: '1000',
          lifiFee: '100'
        }
      ];

      (FeeCollectedEventModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockEvents)
      });

      const response = await request(app)
        .get('/api/events/0x1Bcc58D165e5374D7B492B21c0a572Fd61C0C2a0')
        .expect(200);

      expect(response.body).toEqual(mockEvents);
      expect(FeeCollectedEventModel.find).toHaveBeenCalledWith({
        integrator: '0x1Bcc58D165e5374D7B492B21c0a572Fd61C0C2a0'
      });
    });

    it('should return 500 when database query fails', async () => {
      (FeeCollectedEventModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app)
        .get('/api/events/0x1Bcc58D165e5374D7B492B21c0a572Fd61C0C2a0')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch events' });
    });
  });
}); 