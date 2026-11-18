import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import RichTextToolbarButton from './RichTextToolbarButton';

describe('RichTextToolbarButton', () => {
  it('is a toggle with a pressed state when it gets isSelected', () => {
    render(
      <RichTextToolbarButton icon="bold-14" aria-label="Bold" isSelected />
    );

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('is a plain action without isSelected', () => {
    render(<RichTextToolbarButton icon="link-14" aria-label="Link" />);

    expect(screen.getByRole('button', { name: 'Link' })).not.toHaveAttribute(
      'aria-pressed'
    );
  });
});
