import React from 'react';

import { act, fireEvent, render, screen } from 'utils/testUtils/rtl';

import Invitations from '.';

const NOT_STARTED_TIMEOUT_MS = 120000;
const COUNT_RUNNING_TIMEOUT_MS = 300000;

const NOT_STARTED_MESSAGE = /The system is busy/;
const TIMED_OUT_MESSAGE =
  /Something went wrong while processing your invitations/;

const countImport = (startedAt: string | null) => ({
  data: {
    id: 'count-import-id',
    type: 'invites_import',
    attributes: {
      job_type: 'count_new_seats',
      started_at: startedAt,
      completed_at: null,
      result: {},
    },
  },
});

const completedCountImport = {
  data: {
    id: 'count-import-id',
    type: 'invites_import',
    attributes: {
      job_type: 'count_new_seats',
      started_at: '2026-08-04T10:00:00Z',
      completed_at: '2026-08-04T10:00:05Z',
      result: {
        newly_added_admins_number: 0,
        newly_added_moderators_number: 0,
      },
    },
  },
};

// A second seat count needs its own id: the container remembers which imports
// it has already acted on.
const secondCompletedCountImport = {
  ...completedCountImport,
  data: { ...completedCountImport.data, id: 'count-import-id-2' },
};

const createImport = (startedAt: string | null) => ({
  data: {
    id: 'create-import-id',
    type: 'invites_import',
    attributes: {
      job_type: 'bulk_create',
      started_at: startedAt,
      completed_at: null,
      result: {},
    },
  },
});

// Swapped between assertions to stand in for what the polling hook has last seen.
let mockInvitesImport: any;

jest.mock('api/invites/useInvitesImport', () => () => ({
  data: mockInvitesImport,
  resetQueryData: jest.fn(),
}));

const mockCountNewSeats = jest.fn(() =>
  Promise.resolve({ data: { id: 'count-import-id' } })
);
const mockBulkInvite = jest.fn(() =>
  Promise.resolve({ data: { id: 'create-import-id' } })
);

jest.mock('api/invites/useBulkInviteCountNewSeatsEmails', () => () => ({
  mutateAsync: mockCountNewSeats,
}));
jest.mock('api/invites/useBulkInviteEmails', () => () => ({
  mutateAsync: mockBulkInvite,
}));
jest.mock('api/invites/useBulkInviteCountNewSeatsXLSX', () => () => ({
  mutateAsync: jest.fn(),
}));
jest.mock('api/invites/useBulkInviteXLSX', () => () => ({
  mutateAsync: jest.fn(),
}));

jest.mock('hooks/useAppConfigurationLocales', () => () => ['en']);

let mockSeatsExceeded = false;

jest.mock('hooks/useExceedsSeats', () => () => ({
  loading: false,
  checkIfSeatsExceeded: () => ({
    admin: mockSeatsExceeded,
    moderator: false,
    any: mockSeatsExceeded,
    all: false,
  }),
}));

// The seats modal's contents are not under test here, only which of its two
// screens it opens on.
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (content: unknown) => content,
}));
jest.mock('components/admin/SeatBasedBilling/SeatInfo', () => () => null);
jest.mock(
  'components/admin/SeatBasedBilling/SeatInfo/BillingWarning',
  () => () => null
);
jest.mock(
  'components/admin/SeatBasedBilling/SeatSetSuccess',
  () => () => require('react').createElement('div', null, 'ALL DONE')
);

// The Error component renders nothing without an app configuration.
jest.mock('api/app_configuration/useAppConfiguration', () => () => ({
  data: { data: { id: '1', attributes: { settings: { core: {} } } } },
}));
jest.mock('api/id_methods/useIdMethods', () => () => ({ data: undefined }));

// Submits a single manual invite and waits for the seat count to be requested.
const submitManualInvite = async () => {
  const { container, rerender } = render(<Invitations />);

  fireEvent.click(screen.getByText('Manually enter email addresses'));
  fireEvent.change(container.querySelector('#e2e-emails') as HTMLElement, {
    target: { value: 'someone@example.com' },
  });

  await act(async () => {
    fireEvent.submit(
      container.querySelector('#e2e-invitations') as HTMLElement
    );
  });

  return { container, rerender };
};

const advance = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

describe('Invitations timeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockSeatsExceeded = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('gives up when nothing picks the seat count up', async () => {
    mockInvitesImport = countImport(null);
    await submitManualInvite();

    advance(NOT_STARTED_TIMEOUT_MS - 1000);
    expect(screen.queryByText(NOT_STARTED_MESSAGE)).not.toBeInTheDocument();

    advance(1000);
    expect(screen.getByText(NOT_STARTED_MESSAGE)).toBeInTheDocument();
    // Polling stops and the form leaves its processing state.
    expect(
      screen.queryByText('Sending out invitations. Please wait...')
    ).not.toBeInTheDocument();
  });

  it('waits longer once the seat count has started', async () => {
    mockInvitesImport = countImport('2026-08-04T10:00:00Z');
    await submitManualInvite();

    advance(NOT_STARTED_TIMEOUT_MS);
    expect(screen.queryByText(TIMED_OUT_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(NOT_STARTED_MESSAGE)).not.toBeInTheDocument();

    advance(COUNT_RUNNING_TIMEOUT_MS - NOT_STARTED_TIMEOUT_MS);
    expect(screen.getByText(TIMED_OUT_MESSAGE)).toBeInTheDocument();
  });

  // A queued creation job may still run and send the invitations, so the admin
  // must not be told none were sent.
  it('does not claim nothing was sent when the creation job has not started', async () => {
    mockInvitesImport = undefined;
    const { rerender } = await submitManualInvite();

    // The seat count comes back complete, so the creation job is submitted in
    // its place.
    mockInvitesImport = completedCountImport;
    await act(async () => {
      rerender(<Invitations />);
    });
    expect(mockBulkInvite).toHaveBeenCalled();

    mockInvitesImport = createImport(null);
    rerender(<Invitations />);

    advance(NOT_STARTED_TIMEOUT_MS);
    expect(screen.getByText(TIMED_OUT_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(NOT_STARTED_MESSAGE)).not.toBeInTheDocument();
  });

  // Timing out has to unmount the seats modal, not just hide it: the modal
  // switches itself to a success screen on confirmation and only resets that
  // when it unmounts.
  it('reopens the seats modal on its confirmation step after a timeout', async () => {
    mockSeatsExceeded = true;
    mockInvitesImport = undefined;
    const { container, rerender } = await submitManualInvite();

    // The seat count lands over the tenant's limit, so the modal asks to confirm.
    mockInvitesImport = completedCountImport;
    await act(async () => {
      rerender(<Invitations />);
    });
    expect(
      await screen.findByTestId('confirm-button-text')
    ).toBeInTheDocument();

    // Confirming submits the creation job and shows the success screen.
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-button-text'));
    });
    expect(screen.getByText('ALL DONE')).toBeInTheDocument();

    // Nothing ever picks the creation job up.
    mockInvitesImport = createImport(null);
    rerender(<Invitations />);
    advance(NOT_STARTED_TIMEOUT_MS);
    expect(screen.getByText(TIMED_OUT_MESSAGE)).toBeInTheDocument();

    // Trying again must land on the confirmation step, not the stale success screen.
    mockInvitesImport = undefined;
    await act(async () => {
      fireEvent.submit(
        container.querySelector('#e2e-invitations') as HTMLElement
      );
    });
    mockInvitesImport = secondCompletedCountImport;
    await act(async () => {
      rerender(<Invitations />);
    });

    expect(screen.getByTestId('confirm-button-text')).toBeInTheDocument();
    expect(screen.queryByText('ALL DONE')).not.toBeInTheDocument();
  });
});
