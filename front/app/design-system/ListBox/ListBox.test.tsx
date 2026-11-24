import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import { ReasonKeysContext } from '../disabledReason/reasonKeys';

import ListBox, { ListBoxOption } from '.';

describe('ListBoxOption with a disabled reason', () => {
  it('is marked disabled and cannot be selected', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(
      <ListBox
        aria-label="Status"
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      >
        <ListBoxOption id="new">New</ListBoxOption>
        <ListBoxOption id="done" disabledReason="Not for this phase">
          Done
        </ListBoxOption>
      </ListBox>
    );

    const option = screen.getByRole('option', { name: 'Done' });
    await user.click(option);

    expect(option).toHaveAttribute('aria-disabled', 'true');
    expect(option).toHaveAccessibleDescription('Not for this phase');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('ignores the keys of a surrounding Menu or RadioGroup', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(
      <ReasonKeysContext.Provider value={new Set(['done'])}>
        <ListBox
          aria-label="Status"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        >
          <ListBoxOption id="done">Done</ListBoxOption>
        </ListBox>
      </ReasonKeysContext.Provider>
    );

    await user.click(screen.getByRole('option', { name: 'Done' }));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });
});
