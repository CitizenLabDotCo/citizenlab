import React, { useMemo } from 'react';

// eslint-disable-next-line no-restricted-imports
import { Navigate as TanstackNavigate } from '@tanstack/react-router';

import { updateSearchParams } from './cl-router/updateSearchParams';

// eslint-disable-next-line no-restricted-imports
export * from '@tanstack/react-router';

export const useSearch = (_options: any) => {
  const location = window.location;

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return [
      {
        get: (key: string) => {
          return params[key] ?? null;
        },
        has: (key: string) => {
          return key in params;
        },
        entries: () => Object.entries(params),
      },
      updateSearchParams,
    ] as any;
  }, [location.search]);
};

export const Navigate = (props: any) => {
  return <TanstackNavigate {...props} />;
};
