import React from 'react';
import { screen, render } from 'utils/testUtils/rtl';
import Error from './';
import translationMessages from 'i18n/en';

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
        apiErrors={[
          { error: 'taken', value: '' },
          { error: 'view_name', value: 'value' },
        ]}
        fieldName="view_name"
      />
    );
    expect(screen.getByTestId('error-message-text')).toBeInTheDocument();
    expect(
      screen.getByText(
        (translationMessages as Record<string, string>)[
          'app.errors.view_name_taken'
        ]
      )
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
    expect(
      screen.getByText(
        (translationMessages as Record<string, string>)[
          'app.errors.password_blank'
        ]
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (translationMessages as Record<string, string>)[
          'app.errors.password_too_short'
        ]
      )
    ).toBeInTheDocument();
  });
});
