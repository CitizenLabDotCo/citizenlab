import React from 'react';

import { render, userEvent } from 'utils/testUtils/rtl';

import RowLabel from './RowLabel';

jest.mock(
  'hooks/useLocalize',
  () => () => (multiloc?: { en?: string } | null) => multiloc?.en ?? ''
);

// Regression guards: the whole label — icon included — is the interactive
// target, not just the text.
describe('RowLabel', () => {
  it('fires onClick when the icon is clicked', async () => {
    const onClick = jest.fn();
    const { container } = render(
      <RowLabel
        iconName="spaces"
        titleMultiloc={{ en: 'Label' }}
        onClick={onClick}
      />
    );

    const icon = container.querySelector('svg');
    if (!icon) throw new Error('icon not found');

    await userEvent.click(icon);

    expect(onClick).toHaveBeenCalled();
  });

  it('reports hover when the pointer enters and leaves via the icon', async () => {
    const onHoverChange = jest.fn();
    const { container } = render(
      <RowLabel
        iconName="spaces"
        titleMultiloc={{ en: 'Label' }}
        onHoverChange={onHoverChange}
      />
    );

    const icon = container.querySelector('svg');
    if (!icon) throw new Error('icon not found');

    await userEvent.hover(icon);
    expect(onHoverChange).toHaveBeenLastCalledWith(true);

    await userEvent.unhover(icon);
    expect(onHoverChange).toHaveBeenLastCalledWith(false);
  });
});
