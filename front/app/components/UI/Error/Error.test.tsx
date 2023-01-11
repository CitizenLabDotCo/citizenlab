import React from 'react';
import { screen, render } from 'utils/testUtils/rtl';
import Error from './';

jest.mock('utils/cl-intl');
jest.mock('react-transition-group/CSSTransition', () => ({ children }) => (
  <>{children}</>
));

describe('Error', () => {
  it('should render Error component', () => {
    render(<Error />);
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
  });
  it('should render Error Icon when showIcon=true', () => {
    render(<Error showIcon={true} />);
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });
  it('should not render Error Icon when showIcon=false', () => {
    render(<Error showIcon={false} />);
    expect(screen.queryByTestId('error-icon')).not.toBeInTheDocument();
  });
  it('should render error message text', () => {
    render(<Error text="Error Message" />);
    expect(screen.getByTestId('error-message-text')).toBeInTheDocument();
    expect(screen.getByText('Error Message')).toBeInTheDocument();
  });
  it('should render api error', () => {
    render(
      <Error
        apiErrors={[{ error: 'email_taken', value: 'value' }]}
        fieldName="email"
      />
    );
    expect(screen.getByTestId('error-message-text')).toBeInTheDocument();
    expect(
      screen.getByText('This email is already taken. Please try another one.')
    ).toBeInTheDocument();
  });
  it('should render multiple api errors', () => {
    render(
      <Error
        apiErrors={[
          { error: 'blank', value: '' },
          { error: 'too_short', value: '' },
        ]}
        fieldName="password"
      />
    );
    expect(screen.getByTestId('error-message-text')).toBeInTheDocument();
    expect(screen.getByText('Please enter a password')).toBeInTheDocument();
    expect(
      screen.getByText('The password must be at least 8 characters long')
    ).toBeInTheDocument();
  });
});
