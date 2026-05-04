import React from 'react';

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
  useSearch,
} from '@tanstack/react-router';

export {
  useLocation,
  useParams,
  useSearch,
  Link,
  Outlet,
  RouterProvider,
  createRoute,
};
export type { AnyRoute, LinkProps };

export const Navigate = (props: any) => {
  return <TanstackNavigate {...props} />;
};
