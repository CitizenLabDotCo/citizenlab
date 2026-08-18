import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import ConfirmSendModal from './ConfirmSendModal';

let mockRecipients: { count: number; count_by_locale: Record<string, number> } =
  {
    count: 3,
    count_by_locale: { en: 3 },
  };
let mockBalance = 100;

jest.mock('api/campaigns/sms/recipients/useSmsCampaignRecipients', () =>
  jest.fn(() => ({
    data: { data: { type: 'sms_recipients', attributes: mockRecipients } },
  }))
);

jest.mock('api/campaigns/sms/balance/useSmsBalance', () =>
  jest.fn(() => ({
    data: { data: { attributes: { balance: mockBalance } } },
  }))
);

jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

// The real Modal renders through #modal-portal, which is not in the document yet
// when it looks the element up, so it never mounts under test.
jest.mock(
  'components/UI/Modal',
  () =>
    ({ opened, children }: { opened: boolean; children: React.ReactNode }) =>
      opened ? <div>{children}</div> : null
);

const SHORT_BODY = { en: 'A short update.' };
// 161 characters no longer fit one segment, so every recipient costs two credits.
const TWO_SEGMENT_BODY = { en: 'a'.repeat(161) };

const renderModal = (bodyMultiloc: Record<string, string>) =>
  render(
    <ConfirmSendModal
      opened
      campaignId="campaign-id"
      bodyMultiloc={bodyMultiloc}
      onClose={jest.fn()}
      onConfirm={jest.fn()}
      isSending={false}
    />
  );

// The button marks itself unusable with aria-disabled rather than the attribute.
const sendBlocked = () =>
  screen.getByText('Send now').closest('button')?.ariaDisabled === 'true';

describe('<ConfirmSendModal />', () => {
  beforeEach(() => {
    mockRecipients = { count: 3, count_by_locale: { en: 3 } };
    mockBalance = 100;
  });

  it('shows how many recipients a send would reach', () => {
    renderModal(SHORT_BODY);

    expect(screen.getByText('Recipients').nextSibling).toHaveTextContent('3');
  });

  it('counts one credit per recipient for a single-segment message', () => {
    renderModal(SHORT_BODY);

    expect(screen.getByText('Credits needed').nextSibling).toHaveTextContent(
      '3'
    );
  });

  it('counts a credit per segment per recipient for a longer message', () => {
    renderModal(TWO_SEGMENT_BODY);

    expect(screen.getByText('Credits needed').nextSibling).toHaveTextContent(
      '6'
    );
  });

  it('adds up the credits per locale, since each translation has its own length', () => {
    mockRecipients = { count: 4, count_by_locale: { en: 3, 'nl-BE': 1 } };

    renderModal({ en: 'A short update.', 'nl-BE': 'a'.repeat(161) });

    expect(screen.getByText('Credits needed').nextSibling).toHaveTextContent(
      '5'
    );
  });

  it('allows sending when the balance covers the send', () => {
    renderModal(SHORT_BODY);

    expect(sendBlocked()).toBe(false);
  });

  it('blocks sending when the send needs more credits than are left', () => {
    mockBalance = 2;

    renderModal(SHORT_BODY);

    expect(sendBlocked()).toBe(true);
    expect(
      screen.getByText(/This message needs 3 credits, but only 2 are left/)
    ).toBeInTheDocument();
  });

  it('blocks sending when a send would reach nobody', () => {
    mockRecipients = { count: 0, count_by_locale: {} };

    renderModal(SHORT_BODY);

    expect(sendBlocked()).toBe(true);
    expect(
      screen.getByText(/Nobody matches this message right now/)
    ).toBeInTheDocument();
  });
});
