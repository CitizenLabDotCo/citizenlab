import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import { IAppConfigurationSettingsCore } from 'api/app_configuration/types';

import BillingInfo from './BillingInfo';

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

let mockAppConfiguration: MockAppConfigurationType = {
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

let mockUserSeatsData = {
  data: {
    attributes: {
      admins_number: 2,
      project_moderators_number: 5,
    },
  },
};

jest.mock('api/seats/useSeats', () => () => {
  return {
    data: mockUserSeatsData,
  };
});

describe('BillingInfo', () => {
  beforeEach(() => {
    mockUserSeatsData.data.attributes.admins_number = 2;
    mockUserSeatsData.data.attributes.project_moderators_number = 5;

    mockAppConfiguration.data.attributes.settings.core.maximum_admins_number = 6;
    mockAppConfiguration.data.attributes.settings.core.maximum_moderators_number = 9;
    mockAppConfiguration.data.attributes.settings.core.additional_admins_number = 0;
    mockAppConfiguration.data.attributes.settings.core.additional_moderators_number = 0;
  });

  it('shows correct numbers of seat usage for admins', () => {
    render(<BillingInfo seatType="admin" />);
    expect(screen.getByText('Admin seats')).toBeInTheDocument();

    // Remaining seats
    expect(screen.getByText('Remaining seats')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    // Used seats
    expect(screen.getByText('Used seats')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Total seats
    expect(screen.getByText('Total seats')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('shows correct numbers of seat usage for collaborators', () => {
    render(<BillingInfo seatType="collaborator" />);
    expect(screen.getByText('Collaborator seats')).toBeInTheDocument();

    // Remaining seats
    expect(screen.getByText('Remaining seats')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    // Used seats
    expect(screen.getByText('Used seats')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Total seats
    expect(screen.getByText('Total seats')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('shows nothing for admin seats when maximum_admins_number is unlimited (null)', () => {
    mockUserSeatsData.data.attributes.admins_number = 15;
    mockAppConfiguration.data.attributes.settings.core.maximum_admins_number =
      null;
    render(<BillingInfo seatType="admin" />);
    expect(screen.queryByText('Admin seats')).not.toBeInTheDocument();
  });

  it('shows nothing for collaborator seats when maximum_moderators_number is unlimited (null)', () => {
    mockUserSeatsData.data.attributes.project_moderators_number = 15;
    mockAppConfiguration.data.attributes.settings.core.maximum_moderators_number =
      null;
    render(<BillingInfo seatType="collaborator" />);
    expect(screen.queryByText('Collaborator seats')).not.toBeInTheDocument();
  });
});
