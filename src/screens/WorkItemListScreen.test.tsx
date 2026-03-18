import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { WorkItemListScreen } from './WorkItemListScreen';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockLogout = jest.fn();
const mockUseWorkItems = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, replace: mockReplace }),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

jest.mock('../hooks/useWorkItems', () => ({
  useWorkItems: () => mockUseWorkItems(),
}));

describe('WorkItemListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
  });

  async function renderScreen() {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<WorkItemListScreen />);
    });

    return renderer!.root;
  }

  it('shows loading state', async () => {
    mockUseWorkItems.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const root = await renderScreen();
    expect(
      root.findByProps({ testID: 'work-items-loading-text' }),
    ).toBeTruthy();
  });

  it('shows error state', async () => {
    mockUseWorkItems.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const root = await renderScreen();
    expect(root.findByProps({ testID: 'work-items-error-text' })).toBeTruthy();
  });

  it('shows empty state', async () => {
    mockUseWorkItems.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const root = await renderScreen();
    expect(root.findByProps({ testID: 'work-items-empty-text' })).toBeTruthy();
  });

  it('renders list and navigates to details on item press', async () => {
    mockUseWorkItems.mockReturnValue({
      data: [
        {
          id: 'work-item-1',
          work_code: 'WI-2026-0001',
          title: 'Install Pipeline — Block A',
          description: 'desc',
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
        },
      ],
      isLoading: false,
      isError: false,
    });

    const root = await renderScreen();

    act(() => {
      root
        .findByProps({ testID: 'work-item-card-work-item-1' })
        .props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('WorkItemDetails', {
      workItemId: 'work-item-1',
      title: 'Install Pipeline — Block A',
    });
  });

  it('logs out and navigates to login on logout press', async () => {
    mockUseWorkItems.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const root = await renderScreen();

    await act(async () => {
      await root
        .findByProps({ testID: 'work-items-logout-button' })
        .props.onPress();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('Login');
  });
});
