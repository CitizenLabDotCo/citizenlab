import React from 'react';

import { act, fireEvent, render, screen } from 'utils/testUtils/rtl';

import Invitations, { COUNT_TIMEOUT_MS, CREATE_TIMEOUT_MS } from '.';

const NOT_SENT_MESSAGE = /The system is busy/;
const TIMED_OUT_MESSAGE =
  /Something went wrong while processing your invitations/;

const pendingCountImport = {
  data: {
    id: 'count-import-id',
    type: 'invites_import',
    attributes: {
      job_type: 'count_new_seats',
      completed_at: null,
      result: {},
    },
  },
};

const completedCountImport = {
  data: {
    id: 'count-import-id',
    type: 'invites_import',
    attributes: {
      job_type: 'count_new_seats',
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

const pendingCreateImport = {
  data: {
    id: 'create-import-id',
    type: 'invites_import',
    attributes: {
      job_type: 'bulk_create',
      completed_at: null,
      result: {},
    },
  },
};

const failedCreateImport = {
  data: {
    id: 'create-import-id',
    type: 'invites_import',
    attributes: {
      job_type: 'bulk_create',
      completed_at: '2026-08-04T10:05:00Z',
      result: { errors: [{ error: 'no_invites_specified' }] },
    },
  },
};

// Swapped between assertions to stand in for what the polling hook has last seen.
let mockInvitesImport: any;

// The real hook keys its query on the import id, so clearing that id leaves it
// with no cached entry to return. Modelling that matters: the container reads
// the job type back off this data to decide which stage it is waiting on.
jest.mock('api/invites/useInvitesImport', () => (params: any) => ({
  data: params.importId ? mockInvitesImport : undefined,
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
let mockSeatsCheckLoading = false;

jest.mock(
  'hooks/useExceedsSeats',
  () => () =>
    mockSeatsCheckLoading
      ? { loading: true }
      : {
          loading: false,
          checkIfSeatsExceeded: () => ({
            admin: mockSeatsExceeded,
            moderator: false,
            any: mockSeatsExceeded,
            all: false,
          }),
        }
);

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

// Submits a single manual invite and flushes the resulting seat count request.
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
    mockSeatsCheckLoading = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('gives up when the seat count never completes', async () => {
    mockInvitesImport = pendingCountImport;
    await submitManualInvite();

    advance(COUNT_TIMEOUT_MS - 1000);
    expect(screen.queryByText(NOT_SENT_MESSAGE)).not.toBeInTheDocument();

    advance(1000);
    expect(screen.getByText(NOT_SENT_MESSAGE)).toBeInTheDocument();
    // Absent only when both `processing` and the import id are cleared, the
    // latter being what stops the polling.
    expect(
      screen.queryByText('Sending out invitations. Please wait...')
    ).not.toBeInTheDocument();
  });

  // The creation job gets a longer budget, and it may yet run and send the
  // invitations, so the admin must not be told none were sent.
  it('waits longer for the creation job and does not claim nothing was sent', async () => {
    mockInvitesImport = undefined;
    const { rerender } = await submitManualInvite();

    // The seat count comes back complete, so the creation job is submitted in
    // its place.
    mockInvitesImport = completedCountImport;
    await act(async () => {
      rerender(<Invitations />);
    });
    expect(mockBulkInvite).toHaveBeenCalled();

    mockInvitesImport = pendingCreateImport;
    rerender(<Invitations />);

    advance(COUNT_TIMEOUT_MS);
    expect(screen.queryByText(TIMED_OUT_MESSAGE)).not.toBeInTheDocument();

    advance(CREATE_TIMEOUT_MS - COUNT_TIMEOUT_MS);
    expect(screen.getByText(TIMED_OUT_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(NOT_SENT_MESSAGE)).not.toBeInTheDocument();
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

    // The creation job never completes.
    mockInvitesImport = pendingCreateImport;
    rerender(<Invitations />);
    advance(CREATE_TIMEOUT_MS);
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

  // When the seats data has not loaded, `checkNewSeatsResponse` returns early
  // without submitting anything, leaving `processing` set with no import id.
  // Nothing ran, so this is the seat count budget and the seat count message.
  it('treats a bailed-out seats check as the seat count stage', async () => {
    mockSeatsCheckLoading = true;
    mockInvitesImport = pendingCountImport;
    const { rerender } = await submitManualInvite();

    mockInvitesImport = completedCountImport;
    await act(async () => {
      rerender(<Invitations />);
    });
    expect(mockBulkInvite).not.toHaveBeenCalled();

    advance(COUNT_TIMEOUT_MS);
    expect(screen.getByText(NOT_SENT_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(TIMED_OUT_MESSAGE)).not.toBeInTheDocument();
  });

  // The modal switches itself to a success screen the moment the admin
  // confirms, so a creation job that comes back with errors has to take it
  // down — otherwise the error lands on the form behind an "all done" screen.
  it('closes the success modal when the creation job reports an error', async () => {
    mockSeatsExceeded = true;
    mockInvitesImport = undefined;
    const { rerender } = await submitManualInvite();

    mockInvitesImport = completedCountImport;
    await act(async () => {
      rerender(<Invitations />);
    });
    await act(async () => {
      fireEvent.click(await screen.findByTestId('confirm-button-text'));
    });
    expect(screen.getByText('ALL DONE')).toBeInTheDocument();

    mockInvitesImport = failedCreateImport;
    await act(async () => {
      rerender(<Invitations />);
    });

    expect(
      screen.getByText('Could not find any email addresses.')
    ).toBeInTheDocument();
    expect(screen.queryByText('ALL DONE')).not.toBeInTheDocument();
  });

  // The job reporting an error is one way to fail; the request never being
  // accepted is the other, and it must not reach the success screen either.
  it('does not claim success when the creation request is rejected', async () => {
    mockSeatsExceeded = true;
    mockInvitesImport = undefined;
    const { rerender } = await submitManualInvite();

    mockInvitesImport = completedCountImport;
    await act(async () => {
      rerender(<Invitations />);
    });

    mockBulkInvite.mockRejectedValueOnce({
      errors: [{ error: 'no_invites_specified' }],
    });
    await act(async () => {
      fireEvent.click(await screen.findByTestId('confirm-button-text'));
    });

    expect(screen.queryByText('ALL DONE')).not.toBeInTheDocument();
    // The whole modal has to go, or the error is only in the DOM behind it.
    expect(screen.queryByTestId('confirm-button-text')).not.toBeInTheDocument();
    expect(
      screen.getByText('Could not find any email addresses.')
    ).toBeInTheDocument();
  });
});
