import { useEffect, useState } from 'react';

import useAuthUser from 'api/me/useAuthUser';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import { PARAMS } from './params';
import { projectsIndexSearchSchema } from './searchSchema';

// The tab is persisted along with the filters, so returning to the overview
// lands on the tab (projects, folders, calendar, …) the admin was working in.
const PERSISTED_PARAMS = ['tab', ...PARAMS] as const;

type PersistedParams = Partial<
  Record<(typeof PERSISTED_PARAMS)[number], unknown>
>;

const STORAGE_KEY_PREFIX = 'admin_projects_overview_params';

const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}:${userId}`;

const pickPersistedParams = (
  searchParams: Record<string, unknown>
): PersistedParams =>
  PERSISTED_PARAMS.reduce((acc, paramName) => {
    const value = searchParams[paramName];

    if (value === undefined) {
      return acc;
    }

    return { ...acc, [paramName]: value };
  }, {} as PersistedParams);

const isEmpty = (params: PersistedParams) => Object.keys(params).length === 0;

// sessionStorage is per browser tab, so the persisted params naturally reset
// when the admin opens a new tab or closes this one.
const loadPersistedParams = (userId: string) => {
  try {
    const stored = sessionStorage.getItem(getStorageKey(userId));
    if (!stored) return null;

    const params = pickPersistedParams(JSON.parse(stored));

    // Stored params might no longer be valid (e.g. a sort option was removed
    // in a later release). Restoring them would make the route's
    // validateSearch throw, so drop them instead.
    if (isEmpty(params) || !projectsIndexSearchSchema.isValidSync(params)) {
      sessionStorage.removeItem(getStorageKey(userId));
      return null;
    }

    return params;
  } catch {
    return null;
  }
};

const savePersistedParams = (userId: string, params: PersistedParams) => {
  try {
    if (isEmpty(params)) {
      sessionStorage.removeItem(getStorageKey(userId));
    } else {
      sessionStorage.setItem(getStorageKey(userId), JSON.stringify(params));
    }
  } catch {
    // Ignore storage errors (e.g. storage disabled or full)
  }
};

type Status = 'pending' | 'restoring' | 'done';

/**
 * Keeps the overview's filters, sort and tab across visits within the
 * browser tab's session. The URL stays the source of truth: every change to
 * it is mirrored to sessionStorage, and when the overview is opened without
 * any of these params (e.g. via the admin sidebar), the stored ones are put
 * back into the URL. A URL that already has params (a shared link, Back
 * navigation) is left alone and becomes the new stored state.
 *
 * Returns `isRestoring`: the overview should not render its tabs and filters
 * until it is false, as the filter bar only reads the params on mount.
 */
const usePersistedParams = () => {
  const searchParams = useSearch({
    from: '/$locale/admin/projects/',
  });
  const { data: authUser } = useAuthUser();
  const userId = authUser?.data.id;
  const [status, setStatus] = useState<Status>('pending');

  const currentParams = pickPersistedParams(searchParams);
  const hasParams = !isEmpty(currentParams);

  // Decide once, on mount, whether to restore the stored params.
  useEffect(() => {
    // Wait for the user to load. Signed out (null), there is nothing to
    // restore.
    if (status !== 'pending' || authUser === undefined) return;

    const storedParams =
      userId && !hasParams ? loadPersistedParams(userId) : null;

    if (storedParams) {
      updateSearchParams(storedParams);
      setStatus('restoring');
    } else {
      setStatus('done');
    }
  }, [status, authUser, userId, hasParams]);

  // The restore is done once the router has picked up the restored params.
  useEffect(() => {
    if (status === 'restoring' && hasParams) {
      setStatus('done');
    }
  }, [status, hasParams]);

  // Mirror every change to the params (setting/removing a filter, clearing
  // all, switching tabs) to storage.
  useEffect(() => {
    if (status !== 'done' || !userId) return;

    savePersistedParams(userId, pickPersistedParams(searchParams));
  }, [status, userId, searchParams]);

  return { isRestoring: status !== 'done' };
};

export default usePersistedParams;
