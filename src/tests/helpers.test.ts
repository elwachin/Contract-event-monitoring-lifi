import { ethers, BigNumber } from "ethers";
import { loadFeeCollectorEvents, parseFeeCollectorEvents, getBlockNumber } from "../utils/helpers";
import { CONFIG } from "../config";

// Mock ethers
jest.mock("ethers", () => {
  const mockQueryFilter = jest.fn().mockResolvedValue([]);
  const mockFilters = { FeesCollected: jest.fn() };
  const mockGetBlockNumber = jest.fn().mockResolvedValue(1000);
  const mockContract = jest.fn().mockImplementation(() => ({
    filters: mockFilters,
    queryFilter: mockQueryFilter,
  }));

  return {
    ethers: {
      Contract: mockContract,
      providers: {
        JsonRpcProvider: jest.fn().mockImplementation(() => ({
          getBlockNumber: mockGetBlockNumber,
        })),
      },
    },
    Contract: mockContract,  // Export both under ethers and directly
    BigNumber: {
      from: jest.fn(value => ({ _hex: value })),
    },
  };
});

// Add mock for FeeCollector__factory at the top with other mocks
jest.mock("lifi-contract-typings", () => ({
  FeeCollector__factory: {
    connect: jest.fn(),
    createInterface: jest.fn().mockReturnValue({
      getEvent: jest.fn(),
      encodeFunctionData: jest.fn(),
      decodeFunctionResult: jest.fn(),
    }),
  },
}));

describe("Helper Functions", () => {
  let mockQueryFilter: jest.Mock;
  let mockFilters: { FeesCollected: jest.Mock };
  let mockGetBlockNumber: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Re-initialize mocks before each test
    mockQueryFilter = jest.fn().mockResolvedValue([]);
    mockFilters = { FeesCollected: jest.fn() };
    mockGetBlockNumber = jest.fn().mockResolvedValue(1000);

    // Update the existing mock implementations
    const mockContract = jest.fn().mockImplementation(() => ({
      filters: mockFilters,
      queryFilter: mockQueryFilter,
    }));
    
    (ethers as any).Contract = mockContract;
    (ethers.providers.JsonRpcProvider as any) = jest.fn().mockImplementation(() => ({
      getBlockNumber: mockGetBlockNumber,
    }));
  });

  describe("loadFeeCollectorEvents", () => {
    it("should correctly query events for given block range", async () => {
      // Create a mock filter object
      const mockFilter = {};
      mockFilters.FeesCollected.mockReturnValue(mockFilter);
      
      await loadFeeCollectorEvents(68105543, 68115543);

      expect(ethers.Contract).toHaveBeenCalledWith(
        CONFIG.CONTRACT_ADDRESS,
        expect.any(Object),
        expect.any(Object)
      );

      expect(mockFilters.FeesCollected).toHaveBeenCalled();
      expect(mockQueryFilter).toHaveBeenCalledWith(mockFilter, 68105543, 68115543);
    });

    it("should throw an error when provider fails", async () => {
      mockQueryFilter.mockRejectedValue(new Error("Provider error"));

      await expect(loadFeeCollectorEvents(68105543, 68115543)).rejects.toThrow("Provider error");
    });
  });

  describe("parseFeeCollectorEvents", () => {
    it("should correctly parse valid events", () => {
      const mockEvent = {
        args: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // token address
          "0x1Bcc58D165e5374D7B492B21c0a572Fd61C0C2a0", // integrator address
          { _hex: "1000" }, // integrator fee - using mocked BigNumber format
          { _hex: "100" }, // lifi fee - using mocked BigNumber format
        ],
        blockNumber: 1000,
        transactionHash: "0xbf909ad929152839fb8a7a4261be6cf95f29b07859898d6d5fd0e009e6002509",
      };

      const result = parseFeeCollectorEvents([mockEvent as any]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        transactionHash: "0xbf909ad929152839fb8a7a4261be6cf95f29b07859898d6d5fd0e009e6002509",
        blockNumber: 1000,
        token: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        integrator: "0x1Bcc58D165e5374D7B492B21c0a572Fd61C0C2a0",
        integratorFee: { _hex: { _hex: "1000" } },
        lifiFee: { _hex: { _hex: "100" } },
      });
    });

    it("should throw an error for invalid event data", () => {
      const invalidEvent = {
        args: null,
        blockNumber: null,
        transactionHash: null,
      };

      expect(() => parseFeeCollectorEvents([invalidEvent as any])).toThrow(
        "Event args, blockNumber or transactionHash undefined"
      );
    });
  });

  describe("getBlockNumber", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should return the current block number", async () => {
      mockGetBlockNumber.mockResolvedValue(68115543);
      
      const result = await getBlockNumber();

      expect(result).toBe(68115543);
      expect(mockGetBlockNumber).toHaveBeenCalled();
    });

    it("should throw an error when provider fails", async () => {
      const mockError = new Error("Provider error");
      mockGetBlockNumber.mockRejectedValue(mockError);

      await expect(getBlockNumber()).rejects.toThrow("Provider error");
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching block number:", mockError);
    });
  });
});
