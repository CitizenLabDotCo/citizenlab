import React, { useMemo } from 'react';

import { Navigate as NavigateTanstack } from 'utils/router';

import { updateSearchParams } from './cl-router/updateSearchParams';

// eslint-disable-next-line no-restricted-imports
export * from '@tanstack/react-router';

export const useSearch = (_options: any) => {
  const searchParams = new URLSearchParams(window.location.search);
  const params = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const stringified = JSON.stringify(params);

  return useMemo(() => {
    const params = JSON.parse(stringified);

    return [
      {
        get: (key: string) => {
          return params[key];
        },
        has: (key: string) => {
          return key in params;
        },
        entries: () => Object.entries(params),
      },
      updateSearchParams,
    ] as any;
  }, [stringified]);
};

export const Navigate = (props: any) => {
  return <NavigateTanstack {...props} />;
};
