import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import Button from 'components/UI/Button';

jest.mock('hooks/useLocale');

jest.mock('utils/cl-router/Link');

describe('Button', () => {
  it('should render correctly as button', () => {
    render(<Button>Test</Button>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Test');
  });
  it('should render correctly as external link', () => {
    render(<Button linkTo="https://www.google.com">Test</Button>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Test');
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.google.com'
    );
  });
  it('should render correctly as internal link', () => {
    render(<Button linkTo="/test">Test</Button>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Test');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/test');
  });

  it('should not render a link when disabled', () => {
    render(
      <Button linkTo="/test" disabled>
        Test
      </Button>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
