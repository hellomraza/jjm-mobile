import { QueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { WorkItemComponent } from './useComponents';
import {
  componentQueryKey,
  componentsQueryKey,
  fetchComponent,
  fetchComponents,
} from './useComponents';

jest.mock('../api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const workItemId = 'workitem-123';
const componentId = 'component-1';
const mockComponent: WorkItemComponent = {
  id: componentId,
  work_item_id: workItemId,
  component_id: 'comp-1',
  progress: 0,
  status: 'PENDING',
  created_at: '',
  updated_at: '',
};

const mockResponse: WorkItemComponent[] = [mockComponent];

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe('useComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchComponents calls GET /components/work-item/:workItemId and returns data', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await fetchComponents(workItemId);

    expect(api.get).toHaveBeenCalledWith(`/components/work-item/${workItemId}`);
    expect(result).toEqual(mockResponse);
  });

  it('fetchComponent calls GET /components/:id and returns data', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockComponent });

    const result = await fetchComponent(componentId);

    expect(api.get).toHaveBeenCalledWith(`/components/${componentId}`);
    expect(result).toEqual(mockComponent);
  });

  it('components query key fetches and caches components list', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

    const queryClient = makeQueryClient();

    await queryClient.prefetchQuery({
      queryKey: componentsQueryKey(workItemId),
      queryFn: () => fetchComponents(workItemId),
    });

    expect(api.get).toHaveBeenCalledWith(`/components/work-item/${workItemId}`);
    expect(queryClient.getQueryData(componentsQueryKey(workItemId))).toEqual(
      mockResponse,
    );
  });

  it('component query key fetches and caches component details', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockComponent });

    const queryClient = makeQueryClient();

    await queryClient.prefetchQuery({
      queryKey: componentQueryKey(componentId),
      queryFn: () => fetchComponent(componentId),
    });

    expect(api.get).toHaveBeenCalledWith(`/components/${componentId}`);
    expect(queryClient.getQueryData(componentQueryKey(componentId))).toEqual(
      mockComponent,
    );
  });

  it('components query is not triggered when workItemId is empty', () => {
    const queryClient = makeQueryClient();

    expect(queryClient.getQueryData(componentsQueryKey(''))).toBeUndefined();
    expect(api.get).not.toHaveBeenCalled();
  });
});
