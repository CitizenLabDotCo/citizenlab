import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import moveMenuFocus from './moveMenuFocus';

// A flyout with a search box above its menu, as the long ones have.
const Flyout = () => (
  <Box onKeyDown={moveMenuFocus}>
    <input aria-label="Search" />
    <div role="menu">
      <button role="menuitem">Bikes</button>
      <button role="menuitemcheckbox" aria-checked="false">
        Climate
      </button>
    </div>
  </Box>
);

describe('moveMenuFocus', () => {
  it('goes from the search box to the items and round again', async () => {
    render(<Flyout />);
    await userEvent.click(screen.getByRole('textbox', { name: 'Search' }));

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Bikes' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Climate' })
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Climate' })
    ).toHaveFocus();
  });

  it('leaves Home and End to the caret in the search box', async () => {
    render(<Flyout />);
    const search = screen.getByRole('textbox', { name: 'Search' });
    await userEvent.type(search, 'bik');

    await userEvent.keyboard('{Home}');
    expect(search).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(search).toHaveFocus();
  });
});
