import { useEffect } from 'react';

import useAuthUser from 'api/me/useAuthUser';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import { projectsIndexSearchSchema } from './searchSchema';

const PERSISTED_PARAMS = Object.keys(projectsIndexSearchSchema.fields);

type PersistedParams = Record<string, unknown>;

const STORAGE_KEY = 'admin_projects_overview_params';

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
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const params = pickPersistedParams(parsed.params ?? {});

    if (
      parsed.userId !== userId ||
      isEmpty(params) ||
      !projectsIndexSearchSchema.isValidSync(params)
    ) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return params;
  } catch {
    return null;
  }
};

const savePersistedParams = (userId: string, params: PersistedParams) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, params }));
  } catch {
    // Ignore storage errors
  }
};

export const clearPersistedParamsIfEmpty = () => {
  const searchParams = new URLSearchParams(window.location.search);
  if (PERSISTED_PARAMS.some((paramName) => searchParams.has(paramName))) {
    return;
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
};

const usePersistedParams = () => {
  const searchParams = useSearch({
    from: '/$locale/admin/projects/',
  });
  const { data: authUser } = useAuthUser();
  const userId = authUser?.data.id;

  const hasParams = !isEmpty(pickPersistedParams(searchParams));

  useEffect(() => {
    if (!userId) return;

    const currentParams = pickPersistedParams(searchParams);

    if (!isEmpty(currentParams)) {
      savePersistedParams(userId, currentParams);
      return;
    }

    const storedParams = loadPersistedParams(userId);
    if (storedParams) {
      updateSearchParams(storedParams);
    }
  }, [userId, searchParams]);

  const isRestoring =
    authUser === undefined ||
    (!hasParams && !!userId && loadPersistedParams(userId) !== null);

  return { isRestoring };
};

export default usePersistedParams;
