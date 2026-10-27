import React from 'react';

import translationMessages from 'i18n/en';

import { IdMethodData } from 'api/id_methods/types';

import { screen, render } from 'utils/testUtils/rtl';

import Error from './';

jest.mock('react-transition-group/CSSTransition', () => ({ children }) => (
  <>{children}</>
));

let mockIdMethods: { data: IdMethodData[] } = { data: [] };

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: mockIdMethods }))
);

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
          { error: 'tag_name', value: 'value' },
        ]}
        fieldName="tag_name"
      />
    );
    expect(screen.getByTestId('error-message-text')).toBeInTheDocument();
    expect(
      screen.getByText(
        (translationMessages as Record<string, string>)[
          'app.errors.tag_name_taken'
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
    expect(screen.getByText('Please enter a password')).toBeInTheDocument();
    expect(
      screen.getByText(
        (translationMessages as Record<string, string>)[
          'app.errors.password_too_short'
        ]
      )
    ).toBeInTheDocument();
  });

  it("shows the custom SSO message of the method that enforces the user's domain", () => {
    const baseAttributes = {
      authentication_method: true,
      verification_method: false,
    };
    mockIdMethods = {
      data: [
        {
          id: 'azure',
          type: 'id_method',
          attributes: {
            ...baseAttributes,
            name: 'azureactivedirectory',
            enforced_email_domain_error_multiloc: {
              en: 'Use your Microsoft account',
            },
          },
        },
        {
          id: 'okta',
          type: 'id_method',
          attributes: {
            ...baseAttributes,
            name: 'okta',
            enforced_email_domain_error_multiloc: {
              en: 'Use your Okta account',
            },
          },
        },
      ],
    };

    render(
      <Error
        apiErrors={[
          { error: 'sso_enforced_for_domain', payload: { id_method: 'okta' } },
        ]}
        fieldName="email"
      />
    );

    expect(screen.getByText('Use your Okta account')).toBeInTheDocument();
    expect(
      screen.queryByText('Use your Microsoft account')
    ).not.toBeInTheDocument();
  });
});
