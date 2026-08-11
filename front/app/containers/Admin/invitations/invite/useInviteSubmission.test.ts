import { act, renderHook } from 'utils/testUtils/rtl';

import useInviteSubmission, {
  COUNT_TIMEOUT_MS,
  CREATE_TIMEOUT_MS,
  InviteOptions,
} from './useInviteSubmission';

const anImport = (
  jobType: string,
  { completed = true, result = {} }: { completed?: boolean; result?: any } = {}
) => ({
  data: {
    id: `${jobType}-id`,
    type: 'invites_import',
    attributes: {
      job_type: jobType,
      completed_at: completed ? '2026-08-11T10:00:00Z' : null,
      result,
    },
  },
});

// Stands in for whatever the polling hook has last seen.
let mockInvitesImport: any;
let mockSeatsExceeded: boolean;
let mockSeatsLoading: boolean;

// Stable across renders, like the memoized callback the real hook returns — the
// watchdog depends on it, and a fresh one per render would restart the timer.
const mockResetQueryData = jest.fn();

// The real hook keys its query on the import id, so a cleared id leaves it with
// nothing to return.
jest.mock('api/invites/useInvitesImport', () => (params: any) => ({
  data: params.importId ? mockInvitesImport : undefined,
  resetQueryData: mockResetQueryData,
}));

const mockCountNewSeats = jest.fn();
const mockCreateInvites = jest.fn();
const mockCountNewSeatsXLSX = jest.fn();
const mockCreateInvitesXLSX = jest.fn();

jest.mock('api/invites/useBulkInviteCountNewSeatsEmails', () => () => ({
  mutateAsync: mockCountNewSeats,
}));
jest.mock('api/invites/useBulkInviteEmails', () => () => ({
  mutateAsync: mockCreateInvites,
}));
jest.mock('api/invites/useBulkInviteCountNewSeatsXLSX', () => () => ({
  mutateAsync: mockCountNewSeatsXLSX,
}));
jest.mock('api/invites/useBulkInviteXLSX', () => () => ({
  mutateAsync: mockCreateInvitesXLSX,
}));

jest.mock(
  'hooks/useExceedsSeats',
  () => () =>
    mockSeatsLoading
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

const emailOptions: InviteOptions = {
  emails: ['someone@example.com'],
  locale: 'en',
  roles: [],
  group_ids: null,
  invite_text: null,
};

describe('useInviteSubmission', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockInvitesImport = undefined;
    mockSeatsExceeded = false;
    mockSeatsLoading = false;
    mockCountNewSeats.mockResolvedValue({ data: { id: 'count-id' } });
    mockCreateInvites.mockResolvedValue({ data: { id: 'create-id' } });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const setup = (onCreated?: () => void) =>
    renderHook(() => useInviteSubmission({ onCreated }));

  const submit = async (result: ReturnType<typeof setup>) => {
    await act(async () => {
      await result.result.current.submit(emailOptions);
    });
  };

  // Swaps what the polling hook returns, the way a poll landing would.
  const poll = async (result: ReturnType<typeof setup>, data: any) => {
    mockInvitesImport = data;
    await act(async () => {
      result.rerender();
    });
  };

  const advance = (ms: number) =>
    act(() => {
      jest.advanceTimersByTime(ms);
    });

  describe('the seat count', () => {
    it('asks for confirmation when the seats would be exceeded', async () => {
      mockSeatsExceeded = true;
      const hook = setup();

      await submit(hook);
      await poll(hook, anImport('count_new_seats'));

      expect(hook.result.current.submission.status).toBe(
        'awaitingConfirmation'
      );
      expect(mockCreateInvites).not.toHaveBeenCalled();
    });

    it('creates the invites directly when they would not', async () => {
      const hook = setup();

      await submit(hook);
      await poll(hook, anImport('count_new_seats'));

      expect(hook.result.current.submission.status).toBe('creating');
      expect(mockCreateInvites).toHaveBeenCalledWith(emailOptions);
    });

    it('reports errors the count came back with', async () => {
      const hook = setup();

      await submit(hook);
      await poll(
        hook,
        anImport('count_new_seats', {
          result: { errors: [{ error: 'no_invites_specified' }] },
        })
      );

      expect(hook.result.current.submission).toEqual({
        status: 'failed',
        failure: {
          reason: 'apiErrors',
          errors: [{ error: 'no_invites_specified' }],
        },
      });
    });

    it('reports a rejected request', async () => {
      mockCountNewSeats.mockRejectedValue({ errors: [{ error: 'blocked' }] });
      const hook = setup();

      await submit(hook);

      expect(hook.result.current.submission).toEqual({
        status: 'failed',
        failure: { reason: 'apiErrors', errors: [{ error: 'blocked' }] },
      });
    });

    it('reports a rejection with no error payload as unknown', async () => {
      mockCountNewSeats.mockRejectedValue(new Error('network'));
      const hook = setup();

      await submit(hook);

      expect(hook.result.current.submission).toEqual({
        status: 'failed',
        failure: { reason: 'rejected' },
      });
    });
  });

  describe('the timeouts', () => {
    it('gives up on a seat count that never reports back', async () => {
      const hook = setup();

      await submit(hook);
      advance(COUNT_TIMEOUT_MS - 1000);
      expect(hook.result.current.submission.status).toBe('counting');

      advance(1000);
      expect(hook.result.current.submission).toEqual({
        status: 'failed',
        failure: { reason: 'countTimedOut' },
      });
    });

    it('gives the creation job a longer budget of its own', async () => {
      const hook = setup();

      await submit(hook);
      await poll(hook, anImport('count_new_seats'));
      expect(hook.result.current.submission.status).toBe('creating');

      advance(COUNT_TIMEOUT_MS);
      expect(hook.result.current.submission.status).toBe('creating');

      advance(CREATE_TIMEOUT_MS - COUNT_TIMEOUT_MS);
      expect(hook.result.current.submission).toEqual({
        status: 'failed',
        failure: { reason: 'createTimedOut' },
      });
    });

    // Polling re-renders the consumer while the job runs. A timer restarted on
    // each of those renders would never reach its budget.
    it('keeps the clock running across re-renders', async () => {
      const hook = setup();

      await submit(hook);
      advance(COUNT_TIMEOUT_MS - 1000);

      await act(async () => {
        hook.rerender();
        hook.rerender();
      });

      advance(1000);
      expect(hook.result.current.submission.status).toBe('failed');
    });

    // The seat limits had not loaded when the count landed. The count budget
    // reports it, rather than the admin waiting on a machine that has stalled.
    it('stays on the count budget when the seat limits are unavailable', async () => {
      mockSeatsLoading = true;
      const hook = setup();

      await submit(hook);
      await poll(hook, anImport('count_new_seats'));
      expect(hook.result.current.submission.status).toBe('counting');

      advance(COUNT_TIMEOUT_MS);
      expect(hook.result.current.submission).toEqual({
        status: 'failed',
        failure: { reason: 'countTimedOut' },
      });
    });

    it('is not armed while the modal waits on the admin', async () => {
      mockSeatsExceeded = true;
      const hook = setup();

      await submit(hook);
      await poll(hook, anImport('count_new_seats'));

      advance(CREATE_TIMEOUT_MS * 2);

      expect(hook.result.current.submission.status).toBe(
        'awaitingConfirmation'
      );
    });
  });

  describe('creating the invites', () => {
    const reachCreating = async (hook: ReturnType<typeof setup>) => {
      await submit(hook);
      await poll(hook, anImport('count_new_seats'));
      mockInvitesImport = undefined;
    };

    it('reports success and tells the consumer', async () => {
      const onCreated = jest.fn();
      const hook = setup(onCreated);

      await reachCreating(hook);
      await poll(hook, anImport('bulk_create', { result: [{ id: '1' }] }));

      expect(hook.result.current.submission.status).toBe('created');
      expect(onCreated).toHaveBeenCalled();
    });

    it('reports errors the creation came back with', async () => {
      const onCreated = jest.fn();
      const hook = setup(onCreated);

      await reachCreating(hook);
      await poll(
        hook,
        anImport('bulk_create', { result: { errors: [{ error: 'boom' }] } })
      );

      expect(hook.result.current.submission).toEqual({
        status: 'failed',
        failure: { reason: 'apiErrors', errors: [{ error: 'boom' }] },
      });
      expect(onCreated).not.toHaveBeenCalled();
    });

    // Completion is the signal, not the payload.
    it('completes even when the job reports no result at all', async () => {
      const hook = setup();

      await reachCreating(hook);
      await poll(hook, anImport('bulk_create', { result: null }));

      expect(hook.result.current.submission.status).toBe('created');
    });
  });

  describe('closing the seats modal', () => {
    const reachConfirmation = async (hook: ReturnType<typeof setup>) => {
      mockSeatsExceeded = true;
      await submit(hook);
      await poll(hook, anImport('count_new_seats'));
    };

    it('abandons the submission when closed before confirming', async () => {
      const hook = setup();
      await reachConfirmation(hook);

      act(() => {
        hook.result.current.cancel();
      });

      expect(hook.result.current.submission).toEqual({ status: 'idle' });
      expect(mockCreateInvites).not.toHaveBeenCalled();
    });

    // The job is already running; closing the modal only takes the modal away.
    it('keeps watching the job when closed after confirming', async () => {
      const hook = setup();
      await reachConfirmation(hook);

      await act(async () => {
        await hook.result.current.confirmSeats();
      });
      mockInvitesImport = undefined;

      act(() => {
        hook.result.current.cancel();
      });

      expect(hook.result.current.submission.status).toBe('creating');
      expect(hook.result.current.isWaitingOnJob).toBe(true);

      await poll(hook, anImport('bulk_create', { result: [] }));
      expect(hook.result.current.submission.status).toBe('created');
    });
  });

  describe('dismissing a finished result', () => {
    it('clears a failure', async () => {
      mockCountNewSeats.mockRejectedValue(new Error('network'));
      const hook = setup();

      await submit(hook);
      act(() => {
        hook.result.current.dismissResult();
      });

      expect(hook.result.current.submission).toEqual({ status: 'idle' });
    });

    // Editing the form while a job runs must not abandon it.
    it('leaves a job in flight alone', async () => {
      const hook = setup();

      await submit(hook);
      act(() => {
        hook.result.current.dismissResult();
      });

      expect(hook.result.current.submission.status).toBe('counting');
    });
  });
});
