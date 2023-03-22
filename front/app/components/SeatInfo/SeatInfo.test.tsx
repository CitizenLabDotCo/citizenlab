import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import { IAppConfigurationSettingsCore } from 'api/app_configuration/types';

import SeatInfo from './';

type MockAppConfigurationType = {
  data: {
    id: string;
    attributes: {
      settings: {
        core: {
          maximum_admins_number: IAppConfigurationSettingsCore['maximum_admins_number'];
          maximum_moderators_number: IAppConfigurationSettingsCore['maximum_moderators_number'];
          additional_admins_number: IAppConfigurationSettingsCore['additional_admins_number'];
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
          maximum_admins_number: 6,
          maximum_moderators_number: 9,
          additional_admins_number: 0,
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
      project_moderators_number: 5,
    },
  },
};

jest.mock('api/seats/useSeats', () => () => {
  return {
    data: mockUserSeatsData,
  };
});

describe('SeatInfo', () => {
  it('shows correct numbers of seat usage for admins', () => {
    render(<SeatInfo seatType="admin" />);
    expect(screen.getByText('Current admin seats')).toBeInTheDocument();
    expect(screen.getByText('3/6')).toBeInTheDocument();
    expect(screen.queryByText('Additional seats')).not.toBeInTheDocument();
  });

  it('shows correct numbers of seat usage for collaborators', () => {
    render(<SeatInfo seatType="collaborator" />);
    expect(screen.getByText('Current collaborator seats')).toBeInTheDocument();
    expect(screen.getByText('5/9')).toBeInTheDocument();
    expect(screen.queryByText('Additional seats')).not.toBeInTheDocument();
  });

  it('shows collaborators additional seats when user has used more', () => {
    mockUserSeatsData.data.attributes.project_moderators_number = 15;
    mockAppConfiguration.data.attributes.settings.core.additional_moderators_number = 7;
    render(<SeatInfo seatType="collaborator" />);

    expect(screen.getByText('Current collaborator seats')).toBeInTheDocument();
    expect(screen.getByText('9/9')).toBeInTheDocument();

    expect(screen.queryByText('Additional seats')).toBeInTheDocument();
    // We expect 6/7 because the user has used 15 seats, and they have a maximum of 9 seats in maximum_moderators_number. They have 7 additional seats, and they have used 6 of them.
    expect(screen.getByText('6/7')).toBeInTheDocument();
  });

  it('shows admin additional seats when user has used more', () => {
    mockUserSeatsData.data.attributes.admins_number = 10;
    mockAppConfiguration.data.attributes.settings.core.additional_admins_number = 7;
    render(<SeatInfo seatType="admin" />);

    expect(screen.getByText('Current admin seats')).toBeInTheDocument();
    expect(screen.getByText('6/6')).toBeInTheDocument();

    expect(screen.queryByText('Additional seats')).toBeInTheDocument();
    // We expect 4/7 because the user has used 10 seats, and they have a maximum of 6 seats in maximum_admins_number. They have 7 additional seats, and they have used 4 of them.
    expect(screen.getByText('4/7')).toBeInTheDocument();
  });

  it('shows nothing for admin seats when maximum_admins_number is null', () => {
    mockUserSeatsData.data.attributes.admins_number = 15;
    mockAppConfiguration.data.attributes.settings.core.maximum_admins_number =
      null;
    render(<SeatInfo seatType="admin" />);
    expect(screen.queryByText('Current admin seats')).not.toBeInTheDocument();
    expect(screen.queryByText('Additional seats')).not.toBeInTheDocument();
  });

  it('shows nothing for collaborator seats when maximum_moderators_number is null', () => {
    mockUserSeatsData.data.attributes.project_moderators_number = 15;
    mockAppConfiguration.data.attributes.settings.core.maximum_moderators_number =
      null;
    render(<SeatInfo seatType="collaborator" />);
    expect(
      screen.queryByText('Current collaborator seats')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Additional seats')).not.toBeInTheDocument();
  });
});
