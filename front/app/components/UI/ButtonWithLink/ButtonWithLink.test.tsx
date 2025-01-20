import React from 'react';

import { RouteType } from 'routes';

import { render, screen } from 'utils/testUtils/rtl';

import ButtonWithLink from '.';

describe('ButtonWithLink', () => {
  it('should render correctly as button', () => {
    render(<ButtonWithLink>Test</ButtonWithLink>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Test');
  });
  it('should render correctly as external link', () => {
    render(
      <ButtonWithLink linkTo="https://www.google.com">Test</ButtonWithLink>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Test');
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.google.com'
    );
  });
  it('should render correctly as internal link', () => {
    render(<ButtonWithLink linkTo={'/test' as RouteType}>Test</ButtonWithLink>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Test');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/test');
  });

  it('should not render a link when disabled', () => {
    render(
      <ButtonWithLink linkTo={'/test' as RouteType} disabled>
        Test
      </ButtonWithLink>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});
