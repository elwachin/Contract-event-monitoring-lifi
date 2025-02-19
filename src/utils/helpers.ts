import { BigNumber, ethers } from 'ethers'
import { FeeCollector__factory } from 'lifi-contract-typings'
import { BlockTag } from '@ethersproject/abstract-provider'
import { CONFIG } from '../config'

export interface ParsedFeeCollectedEvents {
  transactionHash: string;
  blockNumber: number;
  token: string;
  integrator: string;
  integratorFee: BigNumber;
  lifiFee: BigNumber;
}

/**
 * For a given block range all `FeesCollected` events are loaded from the Polygon FeeCollector
 */
export const loadFeeCollectorEvents = (fromBlock: BlockTag, toBlock: BlockTag): Promise<ethers.Event[]> => {
 /*
 *TODO: Use multiple RPC endpoints and rotate them for fault tolerance.
 */
  const feeCollector = new ethers.Contract(
    CONFIG.CONTRACT_ADDRESS,
    FeeCollector__factory.createInterface(),
    new ethers.providers.JsonRpcProvider(CONFIG.POLYGON_RPC)
  )
  const filter = feeCollector.filters.FeesCollected()
  return feeCollector.queryFilter(filter, fromBlock, toBlock)
}

/**
 * Takes a list of raw events and parses them into ParsedFeeCollectedEvents
 */
export const parseFeeCollectorEvents = (
  events: ethers.Event[],
): ParsedFeeCollectedEvents[] => {
  return events.map(event => {
    if (!event.args || !event.blockNumber || !event.transactionHash) {
      throw new Error('Event args, blockNumber or transactionHash undefined')
    }
    
    const feesCollected: ParsedFeeCollectedEvents = {
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      token: event.args[0],
      integrator: event.args[1],
      integratorFee: BigNumber.from(event.args[2]),
      lifiFee: BigNumber.from(event.args[3]),
    }
    return feesCollected
  })
}

/**
 * Getting latest blockNumber
 */
export const getBlockNumber = async (): Promise<number> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(CONFIG.POLYGON_RPC);
    const blockNumber: number = await provider.getBlockNumber();
    console.log("Current Polygon Block Number:", blockNumber);
    return blockNumber;
  } catch (error) {
      console.error("Error fetching block number:", error);
      throw error;
  }
}; 