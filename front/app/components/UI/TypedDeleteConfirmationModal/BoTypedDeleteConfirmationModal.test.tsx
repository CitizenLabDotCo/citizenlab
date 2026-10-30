import React from 'react';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import BoTypedDeleteConfirmationModal from './BoTypedDeleteConfirmationModal';

const messages = {
  title: {
    id: 'app.components.UI.TypedDeleteConfirmationModal.test.title',
    defaultMessage: 'Delete project',
  },
  mainWarning: {
    id: 'app.components.UI.TypedDeleteConfirmationModal.test.mainWarning',
    defaultMessage: 'This cannot be undone.',
  },
  confirmationWord: {
    id: 'app.components.UI.TypedDeleteConfirmationModal.test.confirmationWord',
    defaultMessage: 'DELETE',
  },
  deleteButtonText: {
    id: 'app.components.UI.TypedDeleteConfirmationModal.test.deleteButtonText',
    defaultMessage: 'Delete',
  },
};

const renderModal = () => {
  const onConfirm = jest.fn();
  const onClose = jest.fn();

  render(
    <BoTypedDeleteConfirmationModal
      opened
      onClose={onClose}
      onConfirm={onConfirm}
      title={messages.title}
      mainWarning={messages.mainWarning}
      confirmationWord={messages.confirmationWord}
      deleteButtonText={messages.deleteButtonText}
    />
  );

  return { onConfirm, onClose };
};

const deleteButton = () => screen.getByRole('button', { name: 'Delete' });

beforeEach(() => {
  const portal = document.createElement('div');
  portal.id = 'modal-portal';
  document.body.appendChild(portal);
});

afterEach(() => {
  document.getElementById('modal-portal')?.remove();
});

describe('BoTypedDeleteConfirmationModal', () => {
  it('confirms once when Enter is pressed after typing the word', async () => {
    const { onConfirm } = renderModal();

    await userEvent.type(screen.getByRole('textbox'), 'DELETE{enter}');

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
  });

  it('ignores Enter while the typed text does not match', async () => {
    const { onConfirm } = renderModal();

    await userEvent.type(screen.getByRole('textbox'), 'DELET{enter}');

    await waitFor(() =>
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    );
    expect(deleteButton()).toHaveAttribute('aria-disabled', 'true');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms once when the delete button is clicked', async () => {
    const { onConfirm } = renderModal();

    await userEvent.type(screen.getByRole('textbox'), 'DELETE');
    await waitFor(() =>
      expect(deleteButton()).toHaveAttribute('aria-disabled', 'false')
    );
    await userEvent.click(deleteButton());

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
  });

  it('closes without confirming when cancel is clicked', async () => {
    const { onConfirm, onClose } = renderModal();

    await userEvent.type(screen.getByRole('textbox'), 'DELETE');
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
