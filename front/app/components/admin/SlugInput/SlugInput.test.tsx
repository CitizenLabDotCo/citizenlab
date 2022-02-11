import React from 'react';
import { render, screen } from '@testing-library/react';
import SlugInput, { Props } from '.';

jest.mock('utils/cl-intl');
jest.mock('hooks/useAppConfiguration', () => () => ({
  data: { attributes: { name: 'orgName', host: 'localhost' } },
}));
jest.mock('hooks/useLocale');
jest.mock('services/locale');
jest.mock('react-transition-group/CSSTransition', () => ({ children }) => (
  <>{children}</>
));

const defaultProps: Props = {
  apiErrors: {},
  handleSlugOnChange: jest.mock,
  resource: 'folder',
  showSlugErrorMessage: true,
  slug: 'my-folder',
};

describe('SlugInput', () => {
  it('shows the correct preview URL', () => {
    render(<SlugInput {...defaultProps} />);
    expect(screen.getByText(/\/en\/folders\/my-folder$/)).toBeInTheDocument();
  });

  it('shows an error message if validation fails', () => {
    render(<SlugInput {...defaultProps} slug="hyphen-at-the-end-" />);
    expect(
      screen.getByText(/The first and last characters cannot be hyphens/)
    ).toBeInTheDocument();
  });
});
