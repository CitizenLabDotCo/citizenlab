import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import SlugInput, { Props } from '.';

jest.mock('hooks/useAppConfiguration', () => () => ({
  attributes: { name: 'orgName', host: 'localhost' },
}));

const slug = 'my-folder';

const defaultProps: Props = {
  apiErrors: {},
  onSlugChange: jest.mock,
  pathnameWithoutSlug: 'folders',
  showSlugErrorMessage: true,
  slug,
  showSlugChangedWarning: false,
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
