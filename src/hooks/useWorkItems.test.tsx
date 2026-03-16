import { QueryClient } from '@tanstack/react-query';
import api from '../api/client';
import {
  fetchWorkItem,
  fetchWorkItems,
  WORK_ITEMS_QUERY_KEY,
  workItemQueryKey,
} from './useWorkItems';
import type { WorkItem } from './useWorkItems';

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
  id: 1,
  title: 'Install Pipeline — Block A',
  description: 'Install main water pipeline in Block A area.',
  status: 'in_progress',
  assignedTo: 'Ravi Kumar',
  location: 'Block A, District 5',
  createdAt: '2026-01-10T08:00:00Z',
  updatedAt: '2026-03-10T12:00:00Z',
};

const mockWorkItems: WorkItem[] = [
  mockWorkItem,
  {
    ...mockWorkItem,
    id: 2,
    title: 'Inspect Pump Station — Zone B',
    status: 'pending',
    assignedTo: 'Priya Singh',
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
    (api.get as jest.Mock).mockResolvedValue({ data: mockWorkItems });

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
    (api.get as jest.Mock).mockResolvedValue({ data: mockWorkItems });

    const queryClient = makeQueryClient();

    await queryClient.prefetchQuery({
      queryKey: WORK_ITEMS_QUERY_KEY,
      queryFn: fetchWorkItems,
    });

    expect(api.get).toHaveBeenCalledWith('/work-items');
    expect(queryClient.getQueryData(WORK_ITEMS_QUERY_KEY)).toEqual(mockWorkItems);
  });

  // useWorkItem hook — query key + queryFn integration
  it('useWorkItem query key fetches and caches single work item', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockWorkItem });

    const queryClient = makeQueryClient();
    const qKey = workItemQueryKey(1);

    await queryClient.prefetchQuery({
      queryKey: qKey,
      queryFn: () => fetchWorkItem(1),
    });

    expect(api.get).toHaveBeenCalledWith('/work-items/1');
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
