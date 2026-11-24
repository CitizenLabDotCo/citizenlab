import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

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
});
