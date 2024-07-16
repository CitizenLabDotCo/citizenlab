import React from 'react';

import { IAppConfigurationSettingsCore } from 'api/app_configuration/types';

import { render, screen } from 'utils/testUtils/rtl';

import AddModeratorsModal from '.';

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
          maximum_moderators_number: IAppConfigurationSettingsCore['maximum_moderators_number'];
          additional_moderators_number: IAppConfigurationSettingsCore['additional_moderators_number'];
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
          maximum_moderators_number: 9,
          additional_moderators_number: 0,
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

let mockFeatureFlagData = false;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('AddModeratorsModal', () => {
  const closeModal = jest.fn();
  const handleOnAddModeratorsClick = jest.fn();

  beforeEach(() => {
    mockUserSeatsData.data.attributes.moderators_number = 5;

    mockAppConfiguration.data.attributes.settings.core.maximum_moderators_number = 9;
    mockAppConfiguration.data.attributes.settings.core.additional_moderators_number = 0;
  });

  it('shows confirm in button when seats are more than the ones set in limit but within the sum of additional seats and maximum seats', () => {
    mockUserSeatsData.data.attributes.moderators_number = 10;
    mockAppConfiguration.data.attributes.settings.core.additional_moderators_number = 7;
    mockFeatureFlagData = true;
    render(
      <AddModeratorsModal
        addModerators={handleOnAddModeratorsClick}
        showModal
        closeModal={closeModal}
      />
    );

    const confirmButton = screen.getByRole('button', {
      name: 'Confirm',
    });

    expect(screen.getByText('Give manager rights')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to give 1 person manager rights?')
    ).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });

  it('shows buy an additional seat in button when seats are more than the sum of additional seats and maximum seats', () => {
    mockUserSeatsData.data.attributes.moderators_number = 12;
    mockAppConfiguration.data.attributes.settings.core.additional_moderators_number = 1;
    mockFeatureFlagData = true;
    render(
      <AddModeratorsModal
        addModerators={handleOnAddModeratorsClick}
        showModal
        closeModal={closeModal}
      />
    );

    const buyAdditionalSeatButton = screen.getByRole('button', {
      name: 'Buy 1 additional seat',
    });

    expect(screen.getByText('Give manager rights')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You have reached the limit of included seats within your plan, 1 additional seat will be added.'
      )
    ).toBeInTheDocument();
    expect(buyAdditionalSeatButton).toBeInTheDocument();
  });
});
