import React from 'react';

import { groupsData } from 'api/groups/__mocks__/useGroups';

import { render, screen } from 'utils/testUtils/rtl';

import ConfirmSendModal from './ConfirmSendModal';

// The credits themselves are counted server-side, and covered by the segments_for_send specs.
let mockSummary:
  | {
      recipients_count: number;
      segments_needed: number;
      segments_balance: number;
    }
  | undefined = {
  recipients_count: 3,
  segments_needed: 3,
  segments_balance: 100,
};

jest.mock('api/campaigns/sms/send_summary/useSmsSendSummary', () =>
  jest.fn(() => ({
    data: mockSummary && {
      data: { type: 'sms_send_summary', attributes: mockSummary },
    },
  }))
);

// The real Modal renders through #modal-portal, which is not in the document yet
// when it looks the element up, so it never mounts under test.
jest.mock(
  'components/UI/Modal',
  () =>
    ({ opened, children }: { opened: boolean; children: React.ReactNode }) =>
      opened ? <div>{children}</div> : null
);

const renderModal = ({ selectedGroups = groupsData } = {}) =>
  render(
    <ConfirmSendModal
      opened
      campaignId="campaign-id"
      selectedGroups={selectedGroups}
      noGroupsSelected={selectedGroups.length === 0}
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
    mockSummary = {
      recipients_count: 3,
      segments_needed: 3,
      segments_balance: 100,
    };
  });

  it('shows the recipients, credits and remaining balance the server reports', () => {
    mockSummary = {
      recipients_count: 3,
      segments_needed: 6,
      segments_balance: 100,
    };

    renderModal();

    expect(screen.getByText('Recipients').nextSibling).toHaveTextContent('3');
    expect(screen.getByText('Credits needed').nextSibling).toHaveTextContent(
      '6'
    );
    expect(screen.getByText('Credits remaining').nextSibling).toHaveTextContent(
      '100'
    );
  });

  it('names the groups the message goes to', () => {
    renderModal();

    expect(screen.getByText('To').nextSibling).toHaveTextContent(
      'Group 1, Group 2'
    );
  });

  it('shows all users as the audience when no group is selected', () => {
    renderModal({ selectedGroups: [] });

    expect(screen.getByText('To').nextSibling).toHaveTextContent('All users');
  });

  it('allows sending when the balance covers the send', () => {
    renderModal();

    expect(sendBlocked()).toBe(false);
  });

  it('blocks sending when the send needs more credits than are left', () => {
    mockSummary = {
      recipients_count: 3,
      segments_needed: 3,
      segments_balance: 2,
    };

    renderModal();

    expect(sendBlocked()).toBe(true);
    expect(
      screen.getByText(/This message needs 3 credits, but only 2 are left/)
    ).toBeInTheDocument();
  });

  it('blocks sending when a send would reach nobody', () => {
    mockSummary = {
      recipients_count: 0,
      segments_needed: 0,
      segments_balance: 100,
    };

    renderModal();

    expect(sendBlocked()).toBe(true);
    expect(
      screen.getByText(/Nobody matches this message right now/)
    ).toBeInTheDocument();
  });

  it('blocks sending until the figures have loaded', () => {
    mockSummary = undefined;

    renderModal();

    expect(sendBlocked()).toBe(true);
    expect(screen.queryByText('Credits needed')).not.toBeInTheDocument();
  });
});
