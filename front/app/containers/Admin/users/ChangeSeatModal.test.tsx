import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import ChangeSeatModal from './ChangeSeatModal';
import { makeAdmin, makeUser } from 'services/__mocks__/users';

type MockAppConfigurationType = {
  data: {
    id: string;
    attributes: {
      settings: {
        core: {
          maximum_admins_number: number | null;
          maximum_project_moderators_number: number | null;
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
          maximum_project_moderators_number: 9,
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

describe('ChangeSeatModal', () => {
  it('shows confirm in button when seats are not full and admin is adding another admin', () => {
    const closeModal = jest.fn();
    const toggleAdmin = jest.fn();
    const mockUser = makeUser();
    render(
      <ChangeSeatModal
        showModal
        userToChangeSeat={mockUser.data}
        toggleAdmin={toggleAdmin}
        closeModal={closeModal}
      />
    );

    const confirmButton = screen.queryByRole('button', {
      name: 'Confirm',
    });

    expect(screen.queryByText('Give admin rights')).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });

  it('shows buy an additional seat in button when seats are full and admin is trying to add another', () => {
    mockUserSeatsData.data.attributes.admins_number = 7;
    const closeModal = jest.fn();
    const toggleAdmin = jest.fn();
    const mockUser = makeUser();
    render(
      <ChangeSeatModal
        showModal
        userToChangeSeat={mockUser.data}
        toggleAdmin={toggleAdmin}
        closeModal={closeModal}
      />
    );

    const buyAdditionalSeatButton = screen.queryByRole('button', {
      name: 'Buy one additional seat',
    });

    expect(screen.queryByText('Give admin rights')).toBeInTheDocument();
    expect(buyAdditionalSeatButton).toBeInTheDocument();
  });

  it('shows confirm in button when changing to a normal user', () => {
    const closeModal = jest.fn();
    const toggleAdmin = jest.fn();
    const mockUser = makeAdmin();
    render(
      <ChangeSeatModal
        showModal
        userToChangeSeat={mockUser.data}
        toggleAdmin={toggleAdmin}
        closeModal={closeModal}
      />
    );

    const confirmButton = screen.queryByRole('button', {
      name: 'Confirm',
    });

    expect(screen.queryByText('Set as normal user')).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });
});
