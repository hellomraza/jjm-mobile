import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { LoginScreen } from './LoginScreen';

const mockReplace = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    loginMutation: {
      mutateAsync: mockMutateAsync,
      isPending: false,
    },
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockMutateAsync.mockReset();
  });

  it('shows required validation when email/password are empty', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(<LoginScreen />);
    });

    const submitButton = renderer!.root.findByProps({ testID: 'login-submit-button' });

    await act(async () => {
      submitButton.props.onPress();
    });

    const errorText = renderer!.root.findByProps({ testID: 'login-error-text' });
    expect(errorText.props.children).toBe('Email and password are required.');
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates to work item list', async () => {
    mockMutateAsync.mockResolvedValue({ access_token: 'token-1' });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(<LoginScreen />);
    });

    const emailInput = renderer!.root.findByProps({ testID: 'login-email-input' });
    const passwordInput = renderer!.root.findByProps({ testID: 'login-password-input' });
    const submitButton = renderer!.root.findByProps({ testID: 'login-submit-button' });

    await act(async () => {
      emailInput.props.onChangeText('employee@jjm.in');
      passwordInput.props.onChangeText('password123');
    });

    await act(async () => {
      await submitButton.props.onPress();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'employee@jjm.in',
      password: 'password123',
    });
    expect(mockReplace).toHaveBeenCalledWith('WorkItemList');
  });
});
