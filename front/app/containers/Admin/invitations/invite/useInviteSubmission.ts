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
// then create them. Nothing else clears the waiting state if a job never
// reports back — a stalled queue, or a killed worker — so each stage gets a
// budget. Both measured against a 1000-row import, the largest the form accepts.
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
 * `seats` is what the modal displays, and it outlives the admin's approval so
 * the modal can stay up while the invites are created. Only `failed` drops it,
 * which is what takes the modal down rather than leaving an error behind it.
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

// A rejection carries `errors` when the API had something to say about the
// invites; anything else is reported as unknown.
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
 * confirms extra seats.
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

  // Replayed if the admin confirms the extra seats. A ref because nothing
  // renders it.
  const pendingOptions = useRef<InviteOptions | null>(null);

  const { data: invitesImport, resetQueryData } = useInvitesImport({
    importId,
    enabled: !!importId,
  });

  const create = useCallback(async (): Promise<boolean> => {
    const options = pendingOptions.current;
    if (!options) return false;

    // Carries the seat count forward so the modal can go on showing it.
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

  /*
   * Closing the modal means two things. Before confirming, the admin is
   * declining and nothing has been submitted, so the submission is abandoned.
   * After confirming, the job is already running and only the modal goes.
   */
  const cancel = useCallback(() => {
    if (submission.status === 'creating' || submission.status === 'created') {
      setSubmission({ ...submission, seats: null });
      return;
    }

    pendingOptions.current = null;
    setSubmission({ status: 'idle' });
    resetQueryData();
  }, [submission, resetQueryData]);

  // Clears a finished result without disturbing a job in flight; called when
  // the admin edits the form.
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

    // Completion is the signal, not the payload: a job can finish with an
    // empty result and still has to move things on.
    const completed = completedJob(invitesImport, 'count_new_seats');
    if (!completed || !invitesImport) return;

    const result = completed.result ?? {};

    setImportId(null);

    if (result.errors?.length > 0) {
      setSubmission({
        status: 'failed',
        failure: { reason: 'apiErrors', errors: result.errors },
      });
      return;
    }

    // Seat limits are still loading. Staying in `counting` is deliberate: its
    // budget then reports the stall.
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

    const completed = completedJob(invitesImport, 'bulk_create');
    if (!completed) return;

    const result = completed.result ?? {};

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

  // Nothing else clears a job that never reports back. Not armed while the
  // modal waits on the admin: that wait has no deadline.
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
