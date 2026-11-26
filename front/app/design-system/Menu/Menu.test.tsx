import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Button from '../Button';

import Menu, { MenuItem, MenuTrigger } from '.';

describe('MenuItem with a disabled reason', () => {
  it('ignores its action and keeps the menu open', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    render(
      <MenuTrigger>
        <Button hasMenu>Actions</Button>
        <Menu aria-label="Actions" onAction={onAction}>
          <MenuItem id="preview">Preview</MenuItem>
          <MenuItem id="download" disabledReason="Nobody signed up yet">
            Download
          </MenuItem>
        </Menu>
      </MenuTrigger>
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    const item = screen.getByRole('menuitem', { name: 'Download' });
    await user.click(item);

    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
