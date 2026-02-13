import React, { useMemo } from 'react';

/* eslint-disable no-restricted-imports */
import {
  type AnyRoute,
  type LinkProps,
  Navigate as TanstackNavigate,
  Link,
  Outlet,
  RouterProvider,
  createRoute,
  useLocation,
  useParams,
} from '@tanstack/react-router';
/* eslint-enable no-restricted-imports */

import { updateSearchParams } from './cl-router/updateSearchParams';

export { useLocation, useParams, Link, Outlet, RouterProvider, createRoute };
export type { AnyRoute, LinkProps };

export const useSearch = (_options: any) => {
  const { searchStr } = useLocation();

  return useMemo(() => {
    const searchParams = new URLSearchParams(searchStr);
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
  }, [searchStr]);
};

export const Navigate = (props: any) => {
  return <TanstackNavigate {...props} />;
};
