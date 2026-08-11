import { useCallback, useEffect, useRef, useState } from 'react';

import {
  IInviteError,
  IInvitesImport,
  INewBulkInviteEmails,
  INewBulkXLSXInviteXLSX,
} from 'api/invites/types';
import useBulkInviteCountNewSeatsEmails from 'api/invites/useBulkInviteCountNewSeatsEmails';
import useBulkInviteCountNewSeatsXLSX from 'api/invites/useBulkInviteCountNewSeatsXLSX';
import useBulkInviteEmails from 'api/invites/useBulkInviteEmails';
import useBulkInviteXLSX from 'api/invites/useBulkInviteXLSX';
import useInvitesImport from 'api/invites/useInvitesImport';

import useExceedsSeats from 'hooks/useExceedsSeats';

// Inviting runs as two background jobs: count the seats the invites would add,
// then create them. If either never reports back — stalled queue, worker killed
// — nothing else would clear the waiting state, so each stage gets a budget.
// Exported so tests advance the clock by the real ones.
export const COUNT_TIMEOUT_MS = 120000; // 2 minutes
export const CREATE_TIMEOUT_MS = 300000; // 5 minutes

export type InviteOptions = INewBulkInviteEmails | INewBulkXLSXInviteXLSX;

const isXlsxImport = (
  options: InviteOptions
): options is INewBulkXLSXInviteXLSX => 'xlsx' in options;

export type InviteFailure =
  // The count rolls its work back, so nothing was sent. A creation may yet run.
  | { reason: 'countTimedOut' }
  | { reason: 'createTimedOut' }
  | { reason: 'rejected' }
  | { reason: 'apiErrors'; errors: IInviteError[] };

/*
 * `seats` is the seat count the admin was asked to approve, and it outlives the
 * approval: the modal stays up on its success screen while the invites are
 * created. Only `failed` drops it, which is what takes the modal down so an
 * error is never left sitting behind it.
 */
export type InviteSubmission =
  | { status: 'idle' }
  | { status: 'counting' }
  | { status: 'awaitingConfirmation'; seats: IInvitesImport }
  | { status: 'creating'; seats: IInvitesImport | null }
  | { status: 'created'; seats: IInvitesImport | null }
  | { status: 'failed'; failure: InviteFailure };

export const seatsModalContent = (submission: InviteSubmission) =>
  'seats' in submission ? submission.seats : null;

const isWaitingOnJob = (submission: InviteSubmission) =>
  submission.status === 'counting' || submission.status === 'creating';

const completedJob = (
  invitesImport: IInvitesImport | undefined,
  jobType: 'count_new_seats' | 'bulk_create'
) => {
  const attributes = invitesImport?.data.attributes;
  if (!attributes?.completed_at) return undefined;

  // Both job types have an `_xlsx` variant, so match on the prefix.
  return attributes.job_type.includes(jobType) ? attributes : undefined;
};

// A rejected request carries `errors` when the API had something to say about
// the invites themselves; anything else is reported as an unknown failure.
const failureFrom = (rejection: unknown): InviteFailure => {
  const apiErrors = (rejection as { errors?: IInviteError[] } | undefined)
    ?.errors;

  return apiErrors
    ? { reason: 'apiErrors', errors: apiErrors }
    : { reason: 'rejected' };
};

interface Options {
  // Runs once the invites exist, for state this hook does not own (the form).
  onCreated?: () => void;
}

/*
 * Owns the two-stage invite submission: which job is being waited on, the
 * polling, the per-stage timeout, and the options replayed when the admin
 * confirms extra seats. Consumers get a status and three actions.
 */
const useInviteSubmission = ({ onCreated }: Options = {}) => {
  const { mutateAsync: countNewSeatsEmails } =
    useBulkInviteCountNewSeatsEmails();
  const { mutateAsync: countNewSeatsXLSX } = useBulkInviteCountNewSeatsXLSX();
  const { mutateAsync: createFromEmails } = useBulkInviteEmails();
  const { mutateAsync: createFromXLSX } = useBulkInviteXLSX();
  const { checkIfSeatsExceeded } = useExceedsSeats();

  const [submission, setSubmission] = useState<InviteSubmission>({
    status: 'idle',
  });
  const [importId, setImportId] = useState<string | null>(null);

  // Replayed if the admin confirms the extra seats. A ref, not state: nothing
  // renders it, and it must be readable by the callback that consumes it.
  const pendingOptions = useRef<InviteOptions | null>(null);

  const { data: invitesImport, resetQueryData } = useInvitesImport({
    importId,
    enabled: !!importId,
  });

  const create = useCallback(async (): Promise<boolean> => {
    const options = pendingOptions.current;
    if (!options) return false;

    // Carries the approved seat count forward, so the modal can go on showing it.
    setSubmission((current) => ({
      status: 'creating',
      seats: current.status === 'awaitingConfirmation' ? current.seats : null,
    }));

    try {
      const job = isXlsxImport(options)
        ? await createFromXLSX(options)
        : await createFromEmails(options);

      pendingOptions.current = null;
      setImportId(job.data.id);
      return true;
    } catch (errors) {
      setSubmission({ status: 'failed', failure: failureFrom(errors) });
      return false;
    }
  }, [createFromXLSX, createFromEmails]);

  const submit = useCallback(
    async (options: InviteOptions): Promise<boolean> => {
      pendingOptions.current = options;
      setSubmission({ status: 'counting' });

      try {
        const job = isXlsxImport(options)
          ? await countNewSeatsXLSX(options)
          : await countNewSeatsEmails(options);

        setImportId(job.data.id);
        return true;
      } catch (errors) {
        setSubmission({ status: 'failed', failure: failureFrom(errors) });
        return false;
      }
    },
    [countNewSeatsXLSX, countNewSeatsEmails]
  );

  const cancel = useCallback(() => {
    pendingOptions.current = null;
    setSubmission({ status: 'idle' });
    resetQueryData();
  }, [resetQueryData]);

  // Clears a finished result without disturbing a job in flight — the form calls
  // this when the admin edits it after a success or a failure.
  const dismissResult = useCallback(() => {
    setSubmission((current) =>
      isWaitingOnJob(current) || current.status === 'awaitingConfirmation'
        ? current
        : { status: 'idle' }
    );
  }, []);

  // The seat count finished. Either the admin has to approve the extra seats, or
  // the invites can be created straight away.
  useEffect(() => {
    if (submission.status !== 'counting') return;

    const result = completedJob(invitesImport, 'count_new_seats')?.result;
    if (!result || !invitesImport) return;

    setImportId(null);

    if (result.errors?.length > 0) {
      setSubmission({
        status: 'failed',
        failure: { reason: 'apiErrors', errors: result.errors },
      });
      return;
    }

    // Seat limits are still loading. Staying in `counting` is deliberate: the
    // count budget then reports it, rather than the admin waiting forever.
    if (!checkIfSeatsExceeded) return;

    const exceeded = checkIfSeatsExceeded({
      newlyAddedAdminsNumber: result.newly_added_admins_number || 0,
      newlyAddedModeratorsNumber: result.newly_added_moderators_number || 0,
    }).any;

    if (exceeded) {
      setSubmission({ status: 'awaitingConfirmation', seats: invitesImport });
    } else {
      create();
    }
  }, [submission, invitesImport, checkIfSeatsExceeded, create]);

  // The invites were created, or the job reported errors doing it.
  useEffect(() => {
    if (submission.status !== 'creating') return;

    const result = completedJob(invitesImport, 'bulk_create')?.result;
    if (!result) return;

    setImportId(null);

    if (result.errors?.length > 0) {
      setSubmission({
        status: 'failed',
        failure: { reason: 'apiErrors', errors: result.errors },
      });
    } else {
      setSubmission((current) => ({
        status: 'created',
        seats: current.status === 'creating' ? current.seats : null,
      }));
      onCreated?.();
    }

    // Prevents stale data if the admin navigates away and back.
    resetQueryData();
  }, [submission, invitesImport, onCreated, resetQueryData]);

  // Nothing else clears a job that never reports back. Not armed while the seats
  // modal waits on the admin — that wait has no deadline.
  useEffect(() => {
    if (!isWaitingOnJob(submission)) return;

    const counting = submission.status === 'counting';

    const timer = setTimeout(
      () => {
        setImportId(null);
        setSubmission({
          status: 'failed',
          failure: { reason: counting ? 'countTimedOut' : 'createTimedOut' },
        });
        resetQueryData();
      },
      counting ? COUNT_TIMEOUT_MS : CREATE_TIMEOUT_MS
    );

    return () => clearTimeout(timer);
  }, [submission, resetQueryData]);

  return {
    submission,
    isWaitingOnJob: isWaitingOnJob(submission),
    submit,
    confirmSeats: create,
    cancel,
    dismissResult,
  };
};

export default useInviteSubmission;
