import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { WorkItemDetailsScreen } from './WorkItemDetailsScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockUseWorkItem = jest.fn();
const mockUseComponents = jest.fn();
const mockUseUserById = jest.fn();
const mockUseLocationByTypeAndId = jest.fn();

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
    });

    mockUseComponents.mockReturnValue({
      data: [
        { id: 'c1', status: 'APPROVED' },
        { id: 'c2', status: 'PENDING' },
        { id: 'c3', status: 'IN_PROGRESS' },
      ],
      isLoading: false,
      isError: false,
    });

    mockUseUserById.mockReturnValue({
      data: { name: 'ABC Contractors', email: 'contractor@jjm.in' },
    });

    mockUseLocationByTypeAndId.mockImplementation((type: string) => {
      if (type === 'districts') {
        return { data: { districtname: 'Patna' } };
      }

      if (type === 'blocks') {
        return { data: { blockname: 'Dulhin Bazar' } };
      }

      if (type === 'panchayats') {
        return { data: { panchayatname: 'Panchayat 1' } };
      }

      return { data: undefined };
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
    });

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'work-item-details-loading-text' }),
    ).toBeTruthy();
  });

  it('renders details and component summary counts', async () => {
    const root = await renderScreen();

    const completedRow = root.findByProps({
      testID: 'component-completed-count',
    });
    const pendingRow = root.findByProps({ testID: 'component-pending-count' });

    expect(
      completedRow.findAll(node => node.props?.children === '1').length,
    ).toBeGreaterThan(0);
    expect(
      pendingRow.findAll(node => node.props?.children === '2').length,
    ).toBeGreaterThan(0);
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
});
