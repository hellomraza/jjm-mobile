import React from 'react';
import { FlatList } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { AgreementListScreen } from './AgreementListScreen';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockLogout = jest.fn();
const mockUseAgreements = jest.fn();
const mockUseUser = jest.fn();
const mockRefetchAgreements = jest.fn();
const mockRefetchUser = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, replace: mockReplace }),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

jest.mock('../hooks/useAgreements', () => ({
  useAgreements: (search?: string) => mockUseAgreements(search),
}));

jest.mock('../hooks/useUser', () => ({
  useUser: () => mockUseUser(),
}));

describe('AgreementListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
    mockRefetchAgreements.mockResolvedValue(undefined);
    mockRefetchUser.mockResolvedValue(undefined);
    mockUseUser.mockReturnValue({
      data: null,
      refetch: mockRefetchUser,
      isRefetching: false,
    });
  });

  async function renderScreen() {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<AgreementListScreen />);
    });

    return renderer!.root;
  }

  it('shows loading state', async () => {
    mockUseAgreements.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });

    const root = await renderScreen();
    expect(
      root.findByProps({ testID: 'agreement-skeleton-list' }),
    ).toBeTruthy();
    expect(root.findByProps({ testID: 'agreement-skeleton-0' })).toBeTruthy();
  });

  it('shows error state', async () => {
    mockUseAgreements.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });

    const root = await renderScreen();
    expect(root.findByProps({ testID: 'agreement-error-text' })).toBeTruthy();
  });

  it('shows empty state', async () => {
    mockUseAgreements.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });

    const root = await renderScreen();
    expect(root.findByProps({ testID: 'agreement-empty-text' })).toBeTruthy();
  });

  it('renders list and navigates to work items on item press', async () => {
    mockUseAgreements.mockReturnValue({
      data: {
        data: [
          {
            id: 'agreement-1',
            agreementno: 'AGR-2026-0001',
            agreementyear: '2026',
            contractor_id: 'contractor-1',
            work_id: 'work-1',
            created_at: '2026-01-10T08:00:00Z',
            updated_at: '2026-03-10T12:00:00Z',
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'agreement-card-agreement-1' }),
    ).toBeTruthy();

    act(() => {
      root
        .findByProps({ testID: 'agreement-card-agreement-1' })
        .props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('WorkItemList', {
      agreementId: 'agreement-1',
    });
  });

  it('closes menu when tapping outside dropdown', async () => {
    mockUseAgreements.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });

    const root = await renderScreen();

    await act(async () => {
      root.findByProps({ testID: 'agreement-menu-button' }).props.onPress();
    });

    expect(
      root.findByProps({ testID: 'agreement-menu-dropdown' }),
    ).toBeTruthy();

    await act(async () => {
      root.findByProps({ testID: 'agreement-menu-backdrop' }).props.onPress();
    });

    expect(() =>
      root.findByProps({ testID: 'agreement-menu-dropdown' }),
    ).toThrow();
  });

  it('logs out and navigates to login on logout press', async () => {
    mockUseAgreements.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });

    const root = await renderScreen();

    await act(async () => {
      root.findByProps({ testID: 'agreement-menu-button' }).props.onPress();
    });

    await act(async () => {
      await root
        .findByProps({ testID: 'agreement-logout-button' })
        .props.onPress();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('Login');
  });

  it('shows employee name in header', async () => {
    mockUseAgreements.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });
    mockUseUser.mockReturnValue({
      data: {
        id: 'user-1',
        code: 'EMP001',
        email: 'employee@jjm.in',
        name: 'Raza Employee',
        role: 'EM',
        district_id: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
      refetch: mockRefetchUser,
      isRefetching: false,
    });

    const root = await renderScreen();
    const employeeName = root.findByProps({
      testID: 'agreement-employee-name',
    });

    expect(employeeName.props.children).toBe('Raza Employee');
  });

  it('refreshes agreements and user profile on pull-to-refresh', async () => {
    mockUseAgreements.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });

    const root = await renderScreen();
    const flatList = root.findByType(FlatList);

    await act(async () => {
      await flatList.props.onRefresh();
    });

    expect(mockRefetchAgreements).toHaveBeenCalledTimes(1);
    expect(mockRefetchUser).toHaveBeenCalledTimes(1);
  });

  it('triggers agreements search on text input change with debounce', async () => {
    jest.useFakeTimers();
    mockUseAgreements.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });

    const root = await renderScreen();
    const searchInput = root.findByProps({ testID: 'agreement-search-input' });

    await act(async () => {
      searchInput.props.onChangeText('AGR-123');
    });

    // Before timer runs, it shouldn't have queried with the search term yet
    expect(mockUseAgreements).toHaveBeenLastCalledWith('');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(mockUseAgreements).toHaveBeenLastCalledWith('AGR-123');
    jest.useRealTimers();
  });

  it('shows search empty state message when searching', async () => {
    mockUseAgreements.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetchAgreements,
      isRefetching: false,
    });

    jest.useFakeTimers();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<AgreementListScreen />);
    });
    const root = renderer!.root;
    const searchInput = root.findByProps({ testID: 'agreement-search-input' });

    await act(async () => {
      searchInput.props.onChangeText('AGR-999');
      jest.advanceTimersByTime(500);
    });

    const emptyText = root.findByProps({ testID: 'agreement-empty-text' });
    expect(emptyText.props.children).toBe('No agreements found matching your search.');
    jest.useRealTimers();
  });
});
