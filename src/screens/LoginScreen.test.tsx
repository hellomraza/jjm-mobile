import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { LoginScreen } from '../screens/LoginScreen';

const mockReplace = jest.fn();
const mockMutateAsync = jest.fn();

const mockUseAuth = jest.fn(() => ({
  loginMutation: {
    mutateAsync: mockMutateAsync,
    isPending: false,
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockMutateAsync.mockReset();
    mockUseAuth.mockReset();
    mockUseAuth.mockImplementation(() => ({
      loginMutation: {
        mutateAsync: mockMutateAsync,
        isPending: false,
      },
    }));
  });

  it('shows required validation when email/password are empty', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(<LoginScreen />);
    });

    const emailInput = renderer!.root.findByProps({
      testID: 'login-email-input',
    });
    const passwordInput = renderer!.root.findByProps({
      testID: 'login-password-input',
    });
    const submitButton = renderer!.root.findByProps({
      testID: 'login-submit-button',
    });

    await act(async () => {
      emailInput.props.onBlur();
      passwordInput.props.onBlur();
    });

    await act(async () => {
      await submitButton.props.onPress();
    });

    const emailError = renderer!.root.findByProps({
      testID: 'login-email-input-error',
    });
    const passwordError = renderer!.root.findByProps({
      testID: 'login-password-input-error',
    });

    expect(emailError.props.children).toBe('Email is required.');
    expect(passwordError.props.children).toBe('Password is required.');
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates to work item list', async () => {
    mockMutateAsync.mockResolvedValue({ access_token: 'token-1' });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(<LoginScreen />);
    });

    const emailInput = renderer!.root.findByProps({
      testID: 'login-email-input',
    });
    const passwordInput = renderer!.root.findByProps({
      testID: 'login-password-input',
    });
    const submitButton = renderer!.root.findByProps({
      testID: 'login-submit-button',
    });

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

  it('shows loading state while mutation is pending', async () => {
    let resolver: ((value: unknown) => void) | undefined;
    mockMutateAsync.mockImplementation(
      () =>
        new Promise(resolve => {
          resolver = resolve;
        }),
    );

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(<LoginScreen />);
    });

    const emailInput = renderer!.root.findByProps({
      testID: 'login-email-input',
    });
    const passwordInput = renderer!.root.findByProps({
      testID: 'login-password-input',
    });
    const submitButton = renderer!.root.findByProps({
      testID: 'login-submit-button',
    });

    await act(async () => {
      emailInput.props.onChangeText('employee@jjm.in');
      passwordInput.props.onChangeText('password123');
    });

    await act(async () => {
      submitButton.props.onPress();
      await Promise.resolve();
    });

    const renderedTree = JSON.stringify(renderer!.toJSON());
    expect(renderedTree).toContain('Logging in...');

    await act(async () => {
      resolver?.({ access_token: 'token-1' });
    });
  });

  it('shows server message when login submission fails', async () => {
    mockMutateAsync.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(<LoginScreen />);
    });

    const emailInput = renderer!.root.findByProps({
      testID: 'login-email-input',
    });
    const passwordInput = renderer!.root.findByProps({
      testID: 'login-password-input',
    });
    const submitButton = renderer!.root.findByProps({
      testID: 'login-submit-button',
    });

    await act(async () => {
      emailInput.props.onChangeText('employee@jjm.in');
      passwordInput.props.onChangeText('wrong-password');
    });

    await act(async () => {
      await submitButton.props.onPress();
    });

    const submitError = renderer!.root.findByProps({
      testID: 'login-submit-error-text',
    });

    expect(submitError.props.children).toBe('Invalid credentials');
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
