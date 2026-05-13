import React from 'react';

/* eslint-disable no-restricted-imports */
import {
  type AnyRoute,
  type LinkProps,
  Navigate as TanstackNavigate,
  Link,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
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

// Drop-in for the old `react-router-dom` MemoryRouter — TanStack has no
// equivalent. Children are read via a ref so re-renders don't rebuild the
// router (which would lose location state).
export const MemoryRouter = ({
  children,
  initialEntries = ['/'],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => {
  const childrenRef = React.useRef(children);
  childrenRef.current = children;

  const memRouter = React.useMemo(() => {
    const rootRoute = createRootRoute({
      component: () => <>{childrenRef.current}</>,
    });
    return createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RouterProvider router={memRouter} />;
};
