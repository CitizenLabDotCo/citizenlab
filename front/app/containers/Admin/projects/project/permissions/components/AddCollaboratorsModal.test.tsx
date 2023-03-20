import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import AddCollaboratorsModal from './AddCollaboratorsModal';

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

describe('AddCollaboratorsModal', () => {
  const closeModal = jest.fn();
  const handleOnAddModeratorsClick = jest.fn();

  it('shows confirm in button when seats are not full and admin is adding another collaborator', () => {
    render(
      <AddCollaboratorsModal
        addModerators={handleOnAddModeratorsClick}
        showModal
        closeModal={closeModal}
        noOfSeatsToAdd={1}
        noOfSeatsToBuy={1}
      />
    );

    const confirmButton = screen.queryByRole('button', {
      name: 'Confirm',
    });

    expect(screen.queryByText('Give collaborator rights')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Are you sure you want to give 1 person collaborator rights?'
      )
    ).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });

  it('shows buy an additional seat in button when seats are full and admin is trying to add another', () => {
    mockUserSeatsData.data.attributes.project_moderators_number = 10;

    render(
      <AddCollaboratorsModal
        addModerators={handleOnAddModeratorsClick}
        showModal
        closeModal={closeModal}
        noOfSeatsToAdd={1}
        noOfSeatsToBuy={1}
      />
    );

    const buyAdditionalSeatButton = screen.queryByRole('button', {
      name: 'Buy 1 additional seat',
    });

    expect(screen.queryByText('Give collaborator rights')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'You have reached the limit of included seats within your plan, 1 additional seat will be added.'
      )
    ).toBeInTheDocument();
    expect(buyAdditionalSeatButton).toBeInTheDocument();
  });

  it('shows confirm button when noOfSeatsToBuy is 0 and maximum seats were exceeded', () => {
    mockUserSeatsData.data.attributes.project_moderators_number = 10;

    render(
      <AddCollaboratorsModal
        addModerators={handleOnAddModeratorsClick}
        showModal
        closeModal={closeModal}
        noOfSeatsToAdd={2}
        noOfSeatsToBuy={0}
      />
    );

    const confirmButton = screen.queryByRole('button', {
      name: 'Confirm',
    });

    expect(screen.queryByText('Give collaborator rights')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Are you sure you want to give 2 people collaborator rights?'
      )
    ).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });
});
