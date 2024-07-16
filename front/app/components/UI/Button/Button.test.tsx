import React from 'react';

import { RouteType } from 'routes';

import Button from 'components/UI/Button';

import { render, screen } from 'utils/testUtils/rtl';

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
    render(<Button linkTo={'/test' as RouteType}>Test</Button>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Test');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/test');
  });

  it('should not render a link when disabled', () => {
    render(
      <Button linkTo={'/test' as RouteType} disabled>
        Test
      </Button>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});
