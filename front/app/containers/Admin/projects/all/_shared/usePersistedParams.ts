import { useEffect, useState } from 'react';

import useAuthUser from 'api/me/useAuthUser';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import { PARAMS } from './params';
import { projectsIndexSearchSchema } from './searchSchema';

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

const loadPersistedParams = (userId: string) => {
  try {
    const stored = sessionStorage.getItem(getStorageKey(userId));
    if (!stored) return null;

    const params = pickPersistedParams(JSON.parse(stored));

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
    // Ignore storage errors
  }
};

type Status = 'pending' | 'restoring' | 'done';

const usePersistedParams = () => {
  const searchParams = useSearch({
    from: '/$locale/admin/projects/',
  });
  const { data: authUser } = useAuthUser();
  const userId = authUser?.data.id;
  const [status, setStatus] = useState<Status>('pending');

  const currentParams = pickPersistedParams(searchParams);
  const hasParams = !isEmpty(currentParams);

  useEffect(() => {
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

  useEffect(() => {
    if (status === 'restoring' && hasParams) {
      setStatus('done');
    }
  }, [status, hasParams]);

  useEffect(() => {
    if (status !== 'done' || !userId) return;

    savePersistedParams(userId, pickPersistedParams(searchParams));
  }, [status, userId, searchParams]);

  return { isRestoring: status !== 'done' };
};

export default usePersistedParams;
