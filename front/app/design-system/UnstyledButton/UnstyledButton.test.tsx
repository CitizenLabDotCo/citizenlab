import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import UnstyledButton from '.';

it('keeps a button with a disabled reason focusable and prevents activation', async () => {
  const user = userEvent.setup();
  const onPress = jest.fn();

  render(
    <UnstyledButton
      className="row"
      onPress={onPress}
      disabledReason="Enable notifications first."
    >
      Edit notification
    </UnstyledButton>
  );

  await user.tab();
  const button = screen.getByRole('button', { name: 'Edit notification' });
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute('aria-disabled', 'true');
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Enable notifications first.'
  );

  await user.keyboard('{Enter}');
  await user.click(button);
  expect(onPress).not.toHaveBeenCalled();
});
