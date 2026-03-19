import React from 'react';
import { ScrollView } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { spacing } from '../theme/designSystem';
import {
  getProgressFillStyle,
  getStatusVariant,
  getStickyButtonStyle,
  WorkItemDetailsScreen,
} from './WorkItemDetailsScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockUseWorkItem = jest.fn();
const mockUseComponents = jest.fn();
const mockUseUserById = jest.fn();
const mockUseLocationByTypeAndId = jest.fn();
const mockRefetchWorkItem = jest.fn();
const mockRefetchComponents = jest.fn();
const mockRefetchUserById = jest.fn();
const mockRefetchDistrict = jest.fn();
const mockRefetchBlock = jest.fn();
const mockRefetchPanchayat = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({
    params: {
      workItemId: 'work-item-1',
      title: 'Install Pipeline',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../hooks/useWorkItems', () => ({
  useWorkItem: () => mockUseWorkItem(),
}));

jest.mock('../hooks/useComponents', () => ({
  useComponents: () => mockUseComponents(),
}));

jest.mock('../hooks/useUser', () => ({
  useUserById: () => mockUseUserById(),
}));

jest.mock('../hooks/useLocations', () => ({
  useLocationByTypeAndId: (...args: unknown[]) =>
    mockUseLocationByTypeAndId(...args),
}));

describe('WorkItemDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefetchWorkItem.mockResolvedValue(undefined);
    mockRefetchComponents.mockResolvedValue(undefined);
    mockRefetchUserById.mockResolvedValue(undefined);
    mockRefetchDistrict.mockResolvedValue(undefined);
    mockRefetchBlock.mockResolvedValue(undefined);
    mockRefetchPanchayat.mockResolvedValue(undefined);

    mockUseWorkItem.mockReturnValue({
      data: {
        id: 'work-item-1',
        work_code: 'WI-2026-0001',
        title: 'Install Pipeline',
        description: 'Pipeline work details',
        district_id: '1',
        block_id: 2,
        panchayat_id: 3,
        village_id: 0,
        subdivision_id: 0,
        circle_id: 0,
        zone_id: 0,
        schemetype: 'PWS',
        nofhtc: '100',
        amount_approved: 100000,
        payment_amount: 20000,
        serial_no: 1,
        contractor_id: 'contractor-1',
        latitude: 0,
        longitude: 0,
        progress_percentage: 35,
        status: 'IN_PROGRESS',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetchWorkItem,
      isRefetching: false,
    });

    mockUseComponents.mockReturnValue({
      data: [
        { id: 'c1', status: 'APPROVED' },
        { id: 'c2', status: 'PENDING' },
        { id: 'c3', status: 'IN_PROGRESS' },
      ],
      isLoading: false,
      isError: false,
      refetch: mockRefetchComponents,
      isRefetching: false,
    });

    mockUseUserById.mockReturnValue({
      data: { name: 'ABC Contractors', email: 'contractor@jjm.in' },
      refetch: mockRefetchUserById,
      isRefetching: false,
    });

    mockUseLocationByTypeAndId.mockImplementation((type: string) => {
      if (type === 'districts') {
        return {
          data: { districtname: 'Patna' },
          refetch: mockRefetchDistrict,
          isRefetching: false,
        };
      }

      if (type === 'blocks') {
        return {
          data: { blockname: 'Dulhin Bazar' },
          refetch: mockRefetchBlock,
          isRefetching: false,
        };
      }

      if (type === 'panchayats') {
        return {
          data: { panchayatname: 'Panchayat 1' },
          refetch: mockRefetchPanchayat,
          isRefetching: false,
        };
      }

      return {
        data: undefined,
        refetch: jest.fn(),
        isRefetching: false,
      };
    });
  });

  async function renderScreen() {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<WorkItemDetailsScreen />);
    });

    return renderer!.root;
  }

  it('shows loading state while work item is loading', async () => {
    mockUseWorkItem.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetchWorkItem,
      isRefetching: false,
    });

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'work-item-details-loading-text' }),
    ).toBeTruthy();
  });

  it('renders details and component summary counts', async () => {
    const root = await renderScreen();

    const completedCard = root.findByProps({
      testID: 'component-completed-count',
    });
    const pendingCard = root.findByProps({ testID: 'component-pending-count' });

    // Check that the cards exist and contain the expected count values
    expect(completedCard).toBeTruthy();
    expect(pendingCard).toBeTruthy();

    // Verify location data is displayed
    expect(root.findAllByProps({ children: 'Patna' }).length).toBeGreaterThan(
      0,
    );
    expect(
      root.findAllByProps({ children: 'ABC Contractors' }).length,
    ).toBeGreaterThan(0);
  });

  it('navigates to components on button press', async () => {
    const root = await renderScreen();

    act(() => {
      root.findByProps({ testID: 'view-components-button' }).props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('ComponentList', {
      workItemId: 'work-item-1',
      title: 'Install Pipeline',
      work_code: 'WI-2026-0001',
    });
  });

  it('goes back on back button press', async () => {
    const root = await renderScreen();

    act(() => {
      root
        .findByProps({ testID: 'work-item-details-back-button' })
        .props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('refreshes all detail queries on pull-to-refresh', async () => {
    const root = await renderScreen();
    const scrollView = root.findByType(ScrollView);
    const refreshControl = scrollView.props.refreshControl;

    await act(async () => {
      await refreshControl.props.onRefresh();
    });

    expect(mockRefetchWorkItem).toHaveBeenCalledTimes(1);
    expect(mockRefetchComponents).toHaveBeenCalledTimes(1);
    expect(mockRefetchDistrict).toHaveBeenCalledTimes(1);
    expect(mockRefetchBlock).toHaveBeenCalledTimes(1);
    expect(mockRefetchPanchayat).toHaveBeenCalledTimes(1);
    expect(mockRefetchUserById).toHaveBeenCalledTimes(1);
  });

  it('clamps progress fill style width between 0 and 100 percent', () => {
    expect(getProgressFillStyle(-20)).toEqual({ width: '0%' });
    expect(getProgressFillStyle(45)).toEqual({ width: '45%' });
    expect(getProgressFillStyle(120)).toEqual({ width: '100%' });
  });

  it('returns status badge variants based on status text', () => {
    expect(getStatusVariant('APPROVED')).toBe('approved');
    expect(getStatusVariant('IN_PROGRESS')).toBe('pending');
    expect(getStatusVariant('REJECTED')).toBe('rejected');
    expect(getStatusVariant('UNKNOWN')).toBe('default');
  });

  it('computes sticky button style using bottom inset', () => {
    const defaultVerticalPadding = (0 + spacing.md) / 2;
    const insetVerticalPadding = (20 + spacing.md) / 2;

    expect(getStickyButtonStyle(0)).toEqual({
      marginTop: 0,
      paddingBottom: defaultVerticalPadding,
      paddingTop: defaultVerticalPadding,
      borderRadius: 0,
    });

    expect(getStickyButtonStyle(20)).toEqual({
      marginTop: 0,
      paddingBottom: insetVerticalPadding,
      paddingTop: insetVerticalPadding,
      borderRadius: 0,
    });
  });
});
