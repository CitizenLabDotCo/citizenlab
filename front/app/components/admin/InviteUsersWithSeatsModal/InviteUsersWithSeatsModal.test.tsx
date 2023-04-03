import React from 'react';
import { render, screen, userEvent } from 'utils/testUtils/rtl';

import InviteUsersWithSeatsModal from './';

type MockAppConfigurationType = {
  data: {
    id: string;
    attributes: {
      settings: {
        core: {
          maximum_admins_number: number | null;
          maximum_moderators_number: number | null;
        };
      };
    };
  };
};

const mockAppConfiguration: MockAppConfigurationType = {
  data: {
    id: '1',
    attributes: {
      settings: {
        core: {
          maximum_admins_number: 6,
          maximum_moderators_number: 9,
        },
      },
    },
  },
};

jest.mock('api/app_configuration/useAppConfiguration', () => () => {
  return { data: mockAppConfiguration };
});

const mockUserSeatsData = {
  data: {
    attributes: {
      admins_number: 3,
      project_moderators_number: 5,
    },
  },
};

jest.mock('api/seats/useSeats', () => () => {
  return {
    data: mockUserSeatsData,
  };
});

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

    const confirmButton = screen.getByRole('button', {
      name: 'Confirm and send out invitations',
    });

    expect(screen.getByText('Give admin rights')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You are inviting 1 user with admin rights. Based on how many users are included in the invitation, you may need to buy additional seats.'
      )
    ).toBeInTheDocument();

    expect(confirmButton).toBeInTheDocument();
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

    const confirmButton = screen.getByRole('button', {
      name: 'Confirm and send out invitations',
    });

    expect(screen.queryByText('Give collaborator rights')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'You are inviting 2 users with collaborator rights. Based on how many users are included in the invitation, you may need to buy additional seats.'
      )
    ).toBeInTheDocument();

    expect(confirmButton).toBeInTheDocument();
  });

  it('shows an error when user clicks the button without checking the condition checkbox', async () => {
    const user = userEvent.setup();
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

    expect(
      screen.queryByText('Accept the condition to proceed')
    ).not.toBeInTheDocument();

    await user.click(confirmButton);

    expect(
      screen.queryByText('Accept the condition to proceed')
    ).toBeInTheDocument();
  });
});
