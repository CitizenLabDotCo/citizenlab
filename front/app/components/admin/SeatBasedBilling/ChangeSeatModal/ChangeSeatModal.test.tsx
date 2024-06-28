import React from 'react';

import { makeAdmin, makeUser } from 'api/users/__mocks__/useUsers';

import { render, screen } from 'utils/testUtils/rtl';

import ChangeSeatModal from '.';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (content) => content,
}));

const getElementById = document.getElementById.bind(document);
document.getElementById = (id, ...args) => {
  if (id === 'modal-portal') return true;
  return getElementById(id, ...args);
};
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
      moderators_number: 5,
    },
  },
};

jest.mock('api/seats/useSeats', () => () => {
  return {
    data: mockUserSeatsData,
  };
});

describe('ChangeSeatModal', () => {
  const closeModal = jest.fn();
  const changeRoles = jest.fn();
  const mockUser = makeUser();

  it('shows confirm in button when seats are not full and admin is adding another admin', () => {
    render(
      <ChangeSeatModal
        showModal
        userToChangeSeat={mockUser.data}
        changeRoles={changeRoles}
        closeModal={closeModal}
        changingToRoleType="admin"
      />
    );

    const confirmButton = screen.queryByRole('button', {
      name: 'Confirm',
    });

    expect(confirmButton).toBeInTheDocument();
  });

  it('shows buy an additional seat in button when seats are full and admin is trying to add another', () => {
    mockUserSeatsData.data.attributes.admins_number = 7;

    render(
      <ChangeSeatModal
        showModal
        userToChangeSeat={mockUser.data}
        changeRoles={changeRoles}
        closeModal={closeModal}
        changingToRoleType="admin"
      />
    );

    const buyAdditionalSeatButton = screen.queryByRole('button', {
      name: 'Buy one additional seat',
    });

    expect(buyAdditionalSeatButton).toBeInTheDocument();
  });

  it('shows confirm in button when changing to a normal user', () => {
    const mockAdmin = makeAdmin();

    render(
      <ChangeSeatModal
        showModal
        userToChangeSeat={mockAdmin.data}
        changeRoles={changeRoles}
        closeModal={closeModal}
        changingToRoleType="user"
      />
    );

    const confirmButton = screen.queryByRole('button', {
      name: 'Confirm',
    });

    expect(confirmButton).toBeInTheDocument();
  });
});
