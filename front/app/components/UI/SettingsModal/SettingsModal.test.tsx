import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import SettingsModal, { SettingsModalSection } from './index';

const messages = {
  moderation: {
    id: 'app.components.UI.SettingsModal.test.moderation',
    defaultMessage: 'Moderation',
  },
  notifications: {
    id: 'app.components.UI.SettingsModal.test.notifications',
    defaultMessage: 'Notifications',
  },
};

const sections: SettingsModalSection[] = [
  {
    name: 'moderation',
    label: messages.moderation,
    icon: 'eye',
    content: <div>How ideas are named and reviewed.</div>,
  },
  {
    name: 'notifications',
    label: messages.notifications,
    icon: 'notification',
    content: <div>Emails sent automatically to participants.</div>,
  },
];

const renderModal = (
  props: Partial<React.ComponentProps<typeof SettingsModal>> = {}
) =>
  render(
    <SettingsModal
      opened
      close={jest.fn()}
      header="Phase settings"
      sections={sections}
      {...props}
    />
  );

beforeEach(() => {
  const portal = document.createElement('div');
  portal.id = 'modal-portal';
  document.body.appendChild(portal);
});

afterEach(() => {
  document.getElementById('modal-portal')?.remove();
});

describe('SettingsModal', () => {
  it('shows one tab per section and selects the first by default', () => {
    renderModal();

    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByRole('tab', { name: 'Moderation' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('marks the sections up as a vertical tab list', () => {
    renderModal();

    // Deliberately unnamed: screen readers announce the selected tab, and the
    // component is not always a "settings" modal.
    expect(screen.getByRole('tablist')).toHaveAttribute(
      'aria-orientation',
      'vertical'
    );
  });

  it('renders only the selected section', () => {
    renderModal();

    expect(
      screen.getByText('How ideas are named and reviewed.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Emails sent automatically to participants.')
    ).not.toBeInTheDocument();
  });

  it('switches section on click', async () => {
    renderModal();

    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));

    expect(
      screen.getByText('Emails sent automatically to participants.')
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('honours initialSection', () => {
    renderModal({ initialSection: 'notifications' });

    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('moves between tabs with the arrow keys and wraps around', async () => {
    renderModal();

    await userEvent.click(screen.getByRole('tab', { name: 'Moderation' }));
    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByRole('tab', { name: 'Moderation' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('renders a footer only when one is given', () => {
    const { unmount } = renderModal({
      footer: <button>Save changes</button>,
    });

    expect(
      screen.getByRole('button', { name: 'Save changes' })
    ).toBeInTheDocument();

    unmount();
    renderModal();

    expect(
      screen.queryByRole('button', { name: 'Save changes' })
    ).not.toBeInTheDocument();
  });

  it('renders nothing when there are no sections', () => {
    renderModal({ sections: [] });

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});
