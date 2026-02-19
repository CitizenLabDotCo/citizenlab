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

import { updateSearchParams } from './cl-router/updateSearchParams';

export { useLocation, useParams, Link, Outlet, RouterProvider, createRoute };
export type { AnyRoute, LinkProps };

export const useSearch = (_options: any) => {
  const { searchStr } = useLocation();

  return useMemo(
    () =>
      [new URLSearchParams(searchStr), updateSearchParams] as [
        URLSearchParams,
        typeof updateSearchParams
      ],
    [searchStr]
  );
};

export const Navigate = (props: any) => {
  return <TanstackNavigate {...props} />;
};
