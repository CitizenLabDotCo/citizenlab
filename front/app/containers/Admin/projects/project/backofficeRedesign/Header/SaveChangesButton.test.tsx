import React from 'react';

import {
  PageSaveProvider,
  useRegisterPageSaver,
} from 'containers/Admin/projects/_shared/PageSaveContext';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import SaveChangesButton from './SaveChangesButton';

const Panel = ({
  dirty,
  save,
}: {
  dirty: boolean;
  save: () => Promise<void>;
}) => {
  useRegisterPageSaver('panel', { dirty, save });
  return null;
};

const renderButton = (dirty: boolean, save: () => Promise<void>) => (
  <PageSaveProvider>
    <Panel dirty={dirty} save={save} />
    <SaveChangesButton label="Save" />
  </PageSaveProvider>
);

describe('SaveChangesButton', () => {
  it('shows a disabled saved state until the next edit', async () => {
    let dirty = true;
    const save = jest.fn(async () => {
      dirty = false;
    });
    const { rerender } = render(renderButton(dirty, save));

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    rerender(renderButton(dirty, save));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Saved' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );

    rerender(renderButton(true, save));
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('keeps the save label when saving fails', async () => {
    const save = jest.fn().mockRejectedValue(new Error('failed'));
    render(renderButton(true, save));

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Saved' })).toBeNull();
  });
});
