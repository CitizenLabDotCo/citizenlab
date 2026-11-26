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
  phase: {
    id: 'app.components.UI.SettingsModal.test.phase',
    defaultMessage: 'Phase',
  },
  emails: {
    id: 'app.components.UI.SettingsModal.test.emails',
    defaultMessage: 'Emails',
  },
  voting: {
    id: 'app.components.UI.SettingsModal.test.voting',
    defaultMessage: 'Voting',
  },
};

const sections: SettingsModalSection[] = [
  {
    name: 'moderation',
    label: messages.moderation,
    icon: 'eye-16',
    content: <div>How ideas are named and reviewed.</div>,
  },
  {
    name: 'notifications',
    label: messages.notifications,
    icon: 'nav-messaging-16',
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

  it('renders a footer only when an action is given', () => {
    const { unmount } = renderModal({
      primaryAction: { label: 'Save changes' },
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

  it('orders the tabs by group, and arrow keys move across groups', async () => {
    renderModal({
      sections: [
        { ...sections[0], group: messages.phase },
        { ...sections[1], group: messages.emails },
        {
          name: 'voting',
          label: messages.voting,
          icon: 'status-16',
          content: <div>Voting settings.</div>,
          group: messages.phase,
        },
      ],
    });

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Moderation',
      'Voting',
      'Notifications',
    ]);

    await userEvent.click(screen.getByRole('tab', { name: 'Moderation' }));
    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByRole('tab', { name: 'Voting' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('renders nothing when there are no sections', () => {
    renderModal({ sections: [] });

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});
