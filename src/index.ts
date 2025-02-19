import { FeeCollectedEventModel } from './models/FeeCollectedEvent'
import mongoose from 'mongoose'
import { setupAPI } from './api'
import { CONFIG } from './config'
import { ParsedFeeCollectedEvents, loadFeeCollectorEvents, parseFeeCollectorEvents, getBlockNumber } from './utils/helpers'

/**
 * Connects to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(CONFIG.MONGODB_URI)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

/**
 * Gets the last processed block from DB or returns default start block
 */
const getLastProcessedBlock = async (): Promise<number> => {
  const lastEvent = await FeeCollectedEventModel.findOne().sort({ blockNumber: -1 })
  return lastEvent?.blockNumber || CONFIG.START_BLOCK - 1
}

/**
 * Stores events in MongoDB
 */
const storeEvents = async (events: ParsedFeeCollectedEvents[]) => {
  
  for (const event of events) {
    const eventDoc = {
      ...event,
      integratorFee: event.integratorFee.toString(),
      lifiFee: event.lifiFee.toString(),
    }
    
    
    // here to save unique transaction events. so find if transactionHash already exist. once exist then replace
    await FeeCollectedEventModel.findOneAndUpdate(
      { transactionHash: event.transactionHash },
      eventDoc,
      { upsert: true }
    )
  }
}

/**
 * Delays execution for specified milliseconds
 */
const sleep = async (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main monitoring function
 * We can set up an event subscription to receive events as soon as they’re emitted. 
 * However, the subscription frequently misses events. 
 * To address this, we switched to polling with a query filter and a set polling interval
 */
const monitorEvents = async () => {
  try {
    const currentBlock = await getBlockNumber()
    const lastProcessedBlock = await getLastProcessedBlock()
    
    if (currentBlock <= lastProcessedBlock) {
      return
    }

    console.log(`Fetching events from block ${lastProcessedBlock + 1} to ${currentBlock}`)
    const blockInterval = currentBlock - lastProcessedBlock - 1
    
    if (blockInterval > CONFIG.BLOCK_CHUNK_SIZE) {
      // Process the events in smaller chunks according to the configured size to prevent failures when dealing with very large arrays of events
      let startBlock = lastProcessedBlock + 1
      while (startBlock <= currentBlock) {
        const endBlock = Math.min(startBlock + CONFIG.BLOCK_CHUNK_SIZE, currentBlock)
        console.log(`Processing chunk from block ${startBlock} to ${endBlock}`)
        
        const events = await loadFeeCollectorEvents(startBlock, endBlock)
        const parsedEvents = parseFeeCollectorEvents(events)
        
        if (parsedEvents.length > 0) {
          await storeEvents(parsedEvents)
          console.log(`Stored ${parsedEvents.length} new events for blocks ${startBlock}-${endBlock}`)
        }
        
        await sleep(CONFIG.CHUNK_PROCESSING_DELAY)
        
        startBlock = endBlock + 1
      }
    } else {
      const events = await loadFeeCollectorEvents(lastProcessedBlock + 1, currentBlock)
      const parsedEvents = parseFeeCollectorEvents(events)
      
      if (parsedEvents.length > 0) {
        await storeEvents(parsedEvents)
        console.log(`Stored ${parsedEvents.length} new events`)
      }
    }
  } catch (error) {
    console.error('Error monitoring events:', error)
    // Exit the process on critical errors, to prevent skipping blocks in the case of RPC limit error or..
    process.exit(1)
  }
}

const main = async () => {
  await connectDB()
  
  // Set up API server
  setupAPI()
  
  // Initial run
  await monitorEvents()
  
  // Set up polling, This doesn't run until initial run finish
  setInterval(monitorEvents, CONFIG.POLL_INTERVAL)
}

main().catch(console.error)