import React from 'react';

import { render, screen, userEvent, within } from 'utils/testUtils/rtl';

import MessagingDashboard from '.';

let mockPasswordLoginEnabled = true;
let mockSmsEnabled = true;
let mockSmsManualCampaignsEnabled = true;

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) => {
    if (name === 'password_login') return mockPasswordLoginEnabled;
    if (name === 'sms') return mockSmsEnabled;
    if (name === 'sms_manual_campaigns') return mockSmsManualCampaignsEnabled;
    return false;
  })
);

jest.mock('utils/router', () => ({
  useLocation: () => ({ pathname: '/admin/messaging/emails/custom' }),
  Outlet: () => null,
}));

const SMS_TAB = 'SMS';
const UPSELL_TOOLTIP =
  'To learn more about how to enable SMS campaigns, talk to your GovSuccess manager.';

const smsTabLink = () => screen.getByText(SMS_TAB).closest('a')!;

beforeEach(() => {
  mockPasswordLoginEnabled = true;
  mockSmsEnabled = true;
  mockSmsManualCampaignsEnabled = true;
});

describe('<MessagingDashboard />', () => {
  describe('the SMS tab', () => {
    describe('when password login, SMS and SMS campaigns are all enabled', () => {
      it('shows a working tab', async () => {
        render(<MessagingDashboard />);

        expect(smsTabLink()).toHaveAttribute('href', '/en/admin/messaging/sms');
        expect(within(smsTabLink()).getByText('NEW')).toBeInTheDocument();
        expect(smsTabLink()).not.toHaveStyle('pointer-events: none');

        await userEvent.hover(smsTabLink());
        expect(screen.queryByText(UPSELL_TOOLTIP)).not.toBeInTheDocument();
      });
    });

    describe.each([
      [true, false],
      [false, true],
      [false, false],
    ])(
      'when password login is enabled but SMS campaigns are not (sms=%p, sms_manual_campaigns=%p)',
      (smsEnabled, smsManualCampaignsEnabled) => {
        beforeEach(() => {
          mockSmsEnabled = smsEnabled;
          mockSmsManualCampaignsEnabled = smsManualCampaignsEnabled;
        });

        it('shows the tab, but not clickable', () => {
          render(<MessagingDashboard />);

          expect(smsTabLink()).toHaveStyle('pointer-events: none');
          expect(within(smsTabLink()).getByText('NEW')).toBeInTheDocument();
        });

        it('explains how to enable SMS on hover', async () => {
          render(<MessagingDashboard />);

          await userEvent.hover(smsTabLink().parentElement!);

          expect(await screen.findByText(UPSELL_TOOLTIP)).toBeInTheDocument();
        });
      }
    );

    describe('when password login is disabled', () => {
      it.each([true, false])(
        'does not show the tab (sms and sms_manual_campaigns=%p)',
        (smsFeaturesEnabled) => {
          mockPasswordLoginEnabled = false;
          mockSmsEnabled = smsFeaturesEnabled;
          mockSmsManualCampaignsEnabled = smsFeaturesEnabled;
          render(<MessagingDashboard />);

          expect(screen.queryByText(SMS_TAB)).not.toBeInTheDocument();
          expect(screen.queryByText('NEW')).not.toBeInTheDocument();
          expect(screen.getByText('Automated emails')).toBeInTheDocument();
        }
      );
    });
  });
});
