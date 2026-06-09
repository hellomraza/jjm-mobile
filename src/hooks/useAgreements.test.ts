import { QueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { Agreement } from './useAgreements';
import {
  fetchAgreements,
  agreementsQueryKey,
} from './useAgreements';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('../api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const mockAgreement: Agreement = {
  id: 'agreement-1',
  agreementno: 'AGR-2026-0001',
  agreementyear: '2026',
  contractor_id: 'contractor-1',
  work_id: 'work-1',
  created_at: '2026-01-10T08:00:00Z',
  updated_at: '2026-03-10T12:00:00Z',
};

const mockAgreements: Agreement[] = [
  mockAgreement,
  {
    ...mockAgreement,
    id: 'agreement-2',
    agreementno: 'AGR-2026-0002',
  },
];

const mockResponse = {
  data: mockAgreements,
  total: 2,
  limit: 20,
  page: 1,
  totalPages: 1,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAgreements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Query key constants
  it('exports correct query key constants', () => {
    expect(agreementsQueryKey('search-term')).toEqual([
      'agreements',
      { search: 'search-term' },
    ]);
  });

  // fetchAgreements
  it('fetchAgreements calls GET /agreements and returns data', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await fetchAgreements('test-search');

    expect(api.get).toHaveBeenCalledWith('/agreements', {
      params: { search: 'test-search' },
    });
    expect(result).toEqual(mockResponse);
  });

  // useAgreements hook
  it('useAgreements query key fetches and caches agreements list', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const queryClient = makeQueryClient();
    const qKey = agreementsQueryKey('test-search');

    await queryClient.prefetchQuery({
      queryKey: qKey,
      queryFn: () => fetchAgreements('test-search'),
    });

    expect(api.get).toHaveBeenCalledWith('/agreements', {
      params: { search: 'test-search' },
    });
    expect(queryClient.getQueryData(qKey)).toEqual(mockResponse);
  });
});
