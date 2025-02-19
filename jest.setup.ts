const mockFilters = { FeesCollected: jest.fn() };
const mockQueryFilter = jest.fn().mockResolvedValue([]);

jest.mock("ethers", () => ({
    Contract: (jest.fn().mockImplementation(() => ({
      filters: mockFilters,
      queryFilter: mockQueryFilter,
    }))) as unknown as typeof jest.fn,
}));
  