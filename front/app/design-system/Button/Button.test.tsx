import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Button from '.';

describe('Button with a disabled reason', () => {
  it('stays focusable, is marked disabled and ignores presses', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    render(
      <Button onPress={onPress} disabledReason="Nothing to publish yet">
        Publish
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Publish' });
    await user.tab();
    await user.click(button);

    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(onPress).not.toHaveBeenCalled();
  });

  it('never submits its form', () => {
    render(
      <Button type="submit" disabledReason="Fill in the title first">
        Save
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'type',
      'button'
    );
  });
});
