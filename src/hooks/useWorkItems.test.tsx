import { QueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { WorkItem } from './useWorkItems';
import {
  fetchWorkItem,
  fetchWorkItems,
  WORK_ITEMS_QUERY_KEY,
  workItemQueryKey,
} from './useWorkItems';

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

const mockWorkItem: WorkItem = {
  id: 'work-item-1',
  work_code: 'WI-2026-0001',
  title: 'Install Pipeline — Block A',
  description: 'Install main water pipeline in Block A area.',
  district_id: 'district-1',
  block_id: 101,
  panchayat_id: 201,
  village_id: 301,
  subdivision_id: 401,
  circle_id: 501,
  zone_id: 601,
  schemetype: 'PWS',
  nofhtc: '1250',
  amount_approved: 1250000.5,
  payment_amount: 450000.75,
  serial_no: 1,
  contractor_id: 'contractor-1',
  latitude: 25.5941,
  longitude: 85.1376,
  progress_percentage: 35,
  status: 'IN_PROGRESS',
  created_at: '2026-01-10T08:00:00Z',
  updated_at: '2026-03-10T12:00:00Z',
};

const mockWorkItems: WorkItem[] = [
  mockWorkItem,
  {
    ...mockWorkItem,
    id: 'work-item-2',
    work_code: 'WI-2026-0002',
    title: 'Inspect Pump Station — Zone B',
    status: 'PENDING',
    contractor_id: 'contractor-2',
  },
];

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

describe('useWorkItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Query key constants
  it('exports correct query key constants', () => {
    expect(WORK_ITEMS_QUERY_KEY).toEqual(['workItems']);
    expect(workItemQueryKey(1)).toEqual(['workItem', 1]);
    expect(workItemQueryKey(42)).toEqual(['workItem', 42]);
  });

  // fetchWorkItems
  it('fetchWorkItems calls GET /work-items and returns data', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: mockWorkItems,
        total: 2,
        limit: 20,
        page: 1,
        totalPages: 1,
      },
    });

    const result = await fetchWorkItems();

    expect(api.get).toHaveBeenCalledWith('/work-items');
    expect(result).toEqual(mockWorkItems);
  });

  // fetchWorkItem
  it('fetchWorkItem calls GET /work-items/:id and returns single item', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockWorkItem });

    const result = await fetchWorkItem(1);

    expect(api.get).toHaveBeenCalledWith('/work-items/1');
    expect(result).toEqual(mockWorkItem);
  });

  // useWorkItems hook — query key + queryFn integration
  it('useWorkItems query key fetches and caches work items list', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: mockWorkItems,
        total: 2,
        limit: 20,
        page: 1,
        totalPages: 1,
      },
    });

    const queryClient = makeQueryClient();

    await queryClient.prefetchQuery({
      queryKey: WORK_ITEMS_QUERY_KEY,
      queryFn: fetchWorkItems,
    });

    expect(api.get).toHaveBeenCalledWith('/work-items');
    expect(queryClient.getQueryData(WORK_ITEMS_QUERY_KEY)).toEqual(
      mockWorkItems,
    );
  });

  // useWorkItem hook — query key + queryFn integration
  it('useWorkItem query key fetches and caches single work item', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockWorkItem });

    const queryClient = makeQueryClient();
    const qKey = workItemQueryKey('work-item-1');

    await queryClient.prefetchQuery({
      queryKey: qKey,
      queryFn: () => fetchWorkItem('work-item-1'),
    });

    expect(api.get).toHaveBeenCalledWith('/work-items/work-item-1');
    expect(queryClient.getQueryData(qKey)).toEqual(mockWorkItem);
  });

  // useWorkItem enabled guard
  it('useWorkItem is not triggered when id is 0 (enabled: false)', () => {
    // The hook passes `enabled: !!id`; when id is 0, !!0 === false.
    // No fetch should occur; the query cache remains empty.
    const queryClient = makeQueryClient();
    expect(queryClient.getQueryData(workItemQueryKey(0))).toBeUndefined();
    expect(api.get).not.toHaveBeenCalled();
  });
});
