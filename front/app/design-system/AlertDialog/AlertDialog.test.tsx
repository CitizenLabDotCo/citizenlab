import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import AlertDialog from '.';

describe('AlertDialog', () => {
  it('is described by its body text', () => {
    render(
      <AlertDialog
        title="Delete project"
        confirmLabel="Delete"
        onConfirm={jest.fn()}
        isOpen
        onOpenChange={jest.fn()}
      >
        This cannot be undone.
      </AlertDialog>
    );

    expect(
      screen.getByRole('alertdialog', { name: 'Delete project' })
    ).toHaveAccessibleDescription('This cannot be undone.');
  });

  it('starts with focus on Cancel', () => {
    render(
      <AlertDialog
        title="Delete project"
        confirmLabel="Delete"
        onConfirm={jest.fn()}
        isOpen
        onOpenChange={jest.fn()}
      >
        This cannot be undone.
      </AlertDialog>
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('keeps the action off until the confirmation word is typed', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(
      <AlertDialog
        title="Delete phase"
        confirmLabel="Delete phase"
        onConfirm={onConfirm}
        confirmationWord="DELETE"
        isOpen
        onOpenChange={jest.fn()}
      >
        This cannot be undone.
      </AlertDialog>
    );

    const confirm = screen.getByRole('button', { name: 'Delete phase' });
    expect(confirm).toBeDisabled();

    await user.type(
      screen.getByRole('textbox', { name: 'Type DELETE to confirm' }),
      'delete'
    );
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalled();
  });
});
