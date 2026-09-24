import React from 'react';

import { colors, fontSizes, newBO } from '../../utils/styleUtils';
import { render, screen } from '../../utils/testUtils/rtl';

import NewBOButton from '.';

describe('<NewBOButton />', () => {
  const shared = {
    height: '36px',
    padding: '0 16px',
    'border-radius': newBO.borderRadius,
  };

  it('renders the primary variant to spec', () => {
    render(<NewBOButton buttonStyle="admin-dark">Publish</NewBOButton>);

    expect(screen.getByRole('button')).toHaveStyle({
      ...shared,
      'border-width': '0',
      background: colors.primary,
    });
  });

  it('renders the secondary variant to spec', () => {
    render(<NewBOButton buttonStyle="secondary-outlined">Share</NewBOButton>);

    expect(screen.getByRole('button')).toHaveStyle({
      ...shared,
      'border-width': '1px',
      'border-color': colors.grey300,
      background: colors.white,
    });
  });

  it('renders the status variant to spec', () => {
    render(<NewBOButton buttonStyle="status">Live</NewBOButton>);

    expect(screen.getByRole('button')).toHaveStyle({
      ...shared,
      'border-width': '0',
      background: newBO.colors.statusFill,
    });
    expect(screen.getByText('Live')).toHaveStyle({ color: colors.green700 });
  });

  it('labels every variant at 14px / 500', () => {
    render(<NewBOButton buttonStyle="admin-dark">Publish</NewBOButton>);

    expect(screen.getByText('Publish')).toHaveStyle({
      'font-size': `${fontSizes.s}px`,
      'font-weight': '500',
    });
  });
});
