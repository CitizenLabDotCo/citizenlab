import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import InviteUsersWithSeatsModal from '.';

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
          maximum_admins_number: 3,
          maximum_moderators_number: 5,
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
      moderators_number: 5,
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
        newlyAddedAdminsNumber={1}
        newlyAddedModeratorsNumber={0}
      />
    );

    const confirmButton = screen.getByRole('button', {
      name: 'Confirm and send out invitations',
    });

    expect(
      screen.getByText('Confirm impact on seat usage')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'You have reached the limit of available seats within your plan. 1 additional admin seat will be added over the limit.'
      )
    ).toBeInTheDocument();

    expect(confirmButton).toBeInTheDocument();
  });

  it('shows correct copy for moderators', () => {
    render(
      <InviteUsersWithSeatsModal
        inviteUsers={inviteUsers}
        showModal
        closeModal={closeModal}
        newlyAddedAdminsNumber={0}
        newlyAddedModeratorsNumber={2}
      />
    );

    const confirmButton = screen.getByRole('button', {
      name: 'Confirm and send out invitations',
    });

    expect(
      screen.queryByText('Confirm impact on seat usage')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'You have reached the limit of available seats within your plan. 2 additional manager seats will be added over the limit.'
      )
    ).toBeInTheDocument();

    expect(confirmButton).toBeInTheDocument();
  });
});
