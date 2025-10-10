import React from 'react';

import {
  useSearch as useSearchTanstack,
  Navigate as NavigateTanstack,
} from 'utils/router';

import { updateSearchParams } from './cl-router/updateSearchParams';

// eslint-disable-next-line no-restricted-imports
export * from '@tanstack/react-router';

export const useSearch = (_options: any) => {
  const params = useSearchTanstack({ strict: false });

  return [
    {
      get: (key: string) => {
        return params[key];
      },
      entries: () => Object.entries(params),
    },
    updateSearchParams,
  ] as any;
};

export const Navigate = (props: any) => {
  return <NavigateTanstack {...props} />;
};
