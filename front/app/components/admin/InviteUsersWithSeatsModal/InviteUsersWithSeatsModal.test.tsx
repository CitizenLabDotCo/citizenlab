import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import InviteUsersWithSeatsModal from './';

describe('InviteUsersWithSeatsModal', () => {
  const closeModal = jest.fn();
  const inviteUsers = jest.fn();

  it('shows correct copy for admins', () => {
    render(
      <InviteUsersWithSeatsModal
        inviteUsers={inviteUsers}
        showModal
        closeModal={closeModal}
        noOfSeatsToAdd={1}
        seatType="admin"
      />
    );

    const confirmButton = screen.queryByRole('button', {
      name: 'Confirm and send out invitations',
    });

    expect(screen.queryByText('Give admin rights')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'You are inviting 1 user with admin rights. Based on how many users are included in the invitation, you may need to buy additional seats.'
      )
    ).toBeInTheDocument();

    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toBeDisabled();
  });

  it('shows correct copy for collaborators', () => {
    render(
      <InviteUsersWithSeatsModal
        inviteUsers={inviteUsers}
        showModal
        closeModal={closeModal}
        noOfSeatsToAdd={2}
        seatType="collaborator"
      />
    );

    const confirmButton = screen.queryByRole('button', {
      name: 'Confirm and send out invitations',
    });

    expect(screen.queryByText('Give collaborator rights')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'You are inviting 2 users with collaborator rights. Based on how many users are included in the invitation, you may need to buy additional seats.'
      )
    ).toBeInTheDocument();

    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toBeDisabled();
  });

  it('shows a disabled confirm button when user has not acknowledged to be billed for extra seats', () => {
    render(
      <InviteUsersWithSeatsModal
        inviteUsers={inviteUsers}
        showModal
        closeModal={closeModal}
        noOfSeatsToAdd={2}
        seatType="collaborator"
      />
    );

    const confirmButton = screen.getByRole('button', {
      name: 'Confirm and send out invitations',
    });

    expect(screen.queryByText('Give collaborator rights')).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toBeDisabled();

    screen.getByRole('checkbox').click();

    expect(confirmButton).toBeEnabled();
  });
});
