import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import IconButton from '.';

it('renders a named link when given an href', () => {
  render(
    <IconButton
      icon="arrow-left-16"
      aria-label="Back to project"
      href="/admin/projects/1"
    />
  );

  expect(screen.getByRole('link', { name: 'Back to project' })).toHaveAttribute(
    'href',
    '/admin/projects/1'
  );
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('stays a button when a disabled reason replaces the link', () => {
  render(
    <IconButton
      icon="arrow-left-16"
      aria-label="Back to project"
      href="/admin/projects/1"
      disabledReason="Save first."
    />
  );

  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Back to project' })
  ).toHaveAttribute('aria-disabled', 'true');
});
