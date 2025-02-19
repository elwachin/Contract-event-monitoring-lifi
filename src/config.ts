import { config } from 'dotenv'

// Load environment variables from .env file
config()

export const CONFIG = {
  CONTRACT_ADDRESS: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
  POLYGON_RPC: 'https://polygon-rpc.com', // Change this with some paid RPC version
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/fee-collector',
  START_BLOCK: 61500000,
  POLL_INTERVAL: 600000, // 10 minutes
  CHUNK_PROCESSING_DELAY: 1000, // 1 second delay between chunks
  BLOCK_CHUNK_SIZE: 1000, // Number of blocks to process in each chunk
} as const 