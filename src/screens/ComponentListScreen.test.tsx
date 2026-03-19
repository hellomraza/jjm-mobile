import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ComponentListScreen } from './ComponentListScreen';

const mockNavigate = jest.fn();
const mockUseComponents = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({
    params: {
      workItemId: 'work-item-1',
      title: 'Village Water Supply',
    },
  }),
}));

jest.mock('../hooks/useComponents', () => ({
  useComponents: (workItemId: string) => mockUseComponents(workItemId),
}));

describe('ComponentListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function renderScreen() {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<ComponentListScreen />);
    });

    return renderer!.root;
  }

  it('shows loading state', async () => {
    mockUseComponents.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const root = await renderScreen();

    expect(root.findByProps({ testID: 'components-loading-text' })).toBeTruthy();
  });

  it('shows error state', async () => {
    mockUseComponents.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const root = await renderScreen();

    expect(root.findByProps({ testID: 'components-error-text' })).toBeTruthy();
  });

  it('shows empty state', async () => {
    mockUseComponents.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const root = await renderScreen();

    expect(root.findByProps({ testID: 'components-empty-text' })).toBeTruthy();
  });

  it('renders components and navigates to upload screen on press', async () => {
    mockUseComponents.mockReturnValue({
      data: [
        {
          id: 'component-1',
          work_item_id: 'work-item-1',
          component_id: 'master-component-1',
          quantity: 300,
          progress: 120,
          status: 'PENDING',
          created_at: '2026-03-16T00:00:00Z',
          updated_at: '2026-03-16T00:00:00Z',
          component: {
            id: 'master-component-1',
            name: 'Pumping Mains',
            unit: 'meters',
            order_number: 1,
            created_at: '2026-03-16T00:00:00Z',
            updated_at: '2026-03-16T00:00:00Z',
          },
        },
      ],
      isLoading: false,
      isError: false,
    });

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'component-progress-track-component-1' }),
    ).toBeTruthy();
    expect(
      root.findByProps({ testID: 'component-progress-fill-component-1' }),
    ).toBeTruthy();

    act(() => {
      root.findByProps({ testID: 'component-row-component-1' }).props.onPress();
    });

    expect(mockUseComponents).toHaveBeenCalledWith('work-item-1');
    expect(mockNavigate).toHaveBeenCalledWith('UploadPhoto', {
      workItemId: 'work-item-1',
      componentId: 'component-1',
      componentName: 'Pumping Mains',
    });
  });
});