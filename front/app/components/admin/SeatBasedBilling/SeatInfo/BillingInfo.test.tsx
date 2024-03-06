import React from 'react';

import { IAppConfigurationSettingsCore } from 'api/app_configuration/types';

import { render, screen } from 'utils/testUtils/rtl';

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
      admins_number: 2,
      moderators_number: 5,
    },
  },
};

jest.mock('api/seats/useSeats', () => () => {
  return {
    data: mockUserSeatsData,
  };
});

describe('BillingInfo', () => {
  const showsCorrectNumbers = () => {
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
      expect(screen.getByText('Seats within plan')).toBeInTheDocument();
    });

    it('shows correct numbers of seat usage for moderators', () => {
      render(<BillingInfo seatType="moderator" />);
      expect(screen.getByText('Manager seats')).toBeInTheDocument();

      // Remaining seats
      expect(screen.getByText('Remaining seats')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();

      // Used seats
      expect(screen.getByText('Used seats')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();

      // Total seats
      expect(screen.getByText('Total seats')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('Seats within plan')).toBeInTheDocument();
    });
  };

  describe('when additional seats are set (numbers)', () => {
    mockAppConfiguration.data.attributes.settings.core.additional_admins_number = 0;
    mockAppConfiguration.data.attributes.settings.core.additional_moderators_number = 0;

    showsCorrectNumbers();
  });

  describe('when additional seats are not set (null)', () => {
    mockAppConfiguration.data.attributes.settings.core.additional_admins_number =
      null;
    mockAppConfiguration.data.attributes.settings.core.additional_moderators_number =
      null;

    showsCorrectNumbers();
  });

  describe('breakdown of seats', () => {
    it('shows correct descriptive breakdown for total seats when the user has not exceeded the limit', () => {
      mockAppConfiguration.data.attributes.settings.core.additional_admins_number = 7;

      render(<BillingInfo seatType="admin" />);

      // Remaining seats
      expect(screen.getByText('Remaining seats')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();

      // Used seats
      expect(screen.getByText('Used seats')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();

      // Total seats
      expect(screen.getByText('Total seats')).toBeInTheDocument();
      expect(screen.getByText('13')).toBeInTheDocument();
      expect(
        screen.getByText('6 within plan, 7 additional')
      ).toBeInTheDocument();
    });

    it('shows correct descriptive breakdown for total seats when seats are exceeded', () => {
      mockUserSeatsData.data.attributes.admins_number = 10;
      mockAppConfiguration.data.attributes.settings.core.additional_admins_number = 7;

      render(<BillingInfo seatType="admin" />);

      // Remaining seats
      expect(screen.getByText('Remaining seats')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      // Used seats
      expect(screen.getByText('Used seats')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();

      // Total seats
      expect(screen.getByText('Total seats')).toBeInTheDocument();
      expect(screen.getByText('13')).toBeInTheDocument();
      expect(
        screen.getByText('6 within plan, 7 additional')
      ).toBeInTheDocument();
    });
  });

  describe('when maximum number of seats are unlimited', () => {
    beforeEach(() => {
      mockAppConfiguration.data.attributes.settings.core.maximum_admins_number =
        null;
      mockAppConfiguration.data.attributes.settings.core.maximum_moderators_number =
        null;
    });

    it('shows nothing for admin seats when maximum_admins_number is unlimited (null)', () => {
      render(<BillingInfo seatType="admin" />);
      expect(screen.queryByText('Admin seats')).not.toBeInTheDocument();
    });

    it('shows nothing for moderator seats when maximum_moderators_number is unlimited (null)', () => {
      render(<BillingInfo seatType="moderator" />);
      expect(screen.queryByText('Manager seats')).not.toBeInTheDocument();
    });
  });
});
