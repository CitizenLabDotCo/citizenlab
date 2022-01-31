import React from 'react';
import { render, screen } from '@testing-library/react';
import SlugInput from '.';

jest.mock('utils/cl-intl');
jest.mock('hooks/useAppConfiguration', () => () => ({
  data: { attributes: { name: 'orgName', host: 'localhost' } },
}));
jest.mock('hooks/useLocale');
jest.mock('services/locale');

const defaultProps = {
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
    render(<SlugInput slug="hyphen-at-the-end-" {...defaultProps} />);
    expect(
      screen.getByText(/The first and last characters cannot be hyphens/)
    ).toBeInTheDocument();
  });
});
