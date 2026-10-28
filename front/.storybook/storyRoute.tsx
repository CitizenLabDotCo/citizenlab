/* eslint-disable no-restricted-imports */
import React from 'react';

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

// The route a story renders under. A page that reads its route's params
// with a strict `useParams({ from })` throws TanStack's "Invariant failed"
// unless that route matched, and the platform's MemoryRouter has the root
// route only. Such a page's story names the route:
//
//   parameters: {
//     route: {
//       from: '/$locale/admin/projects/$projectId',
//       params: { projectId: project1.id },
//     },
//   },
//
// `$locale` is the story's language unless the params give one.
export type StoryRoute = {
  from: string;
  params?: Record<string, string>;
};

// The address the story opens at: each `$name` of the route filled in.
export const urlOf = (route: StoryRoute, locale: string) => {
  const params: Record<string, string> = { locale, ...route.params };
  return route.from.replace(/\$(\w+)/g, (_, name: string) =>
    encodeURIComponent(params[name] ?? name)
  );
};

// Children are read through a ref, as in the platform's MemoryRouter, so a
// re-render does not rebuild the router and lose its location; another
// route or address gets a router of its own.
export const AtRoute = ({
  route,
  locale,
  children,
}: {
  route: StoryRoute;
  locale: string;
  children: React.ReactNode;
}) => {
  const childrenRef = React.useRef(children);
  childrenRef.current = children;
  const url = urlOf(route, locale);
  const router = React.useMemo(() => {
    const root = createRootRoute();
    const page = createRoute({
      getParentRoute: () => root,
      path: route.from,
      component: () => <>{childrenRef.current}</>,
    });
    return createRouter({
      routeTree: root.addChildren([page]),
      history: createMemoryHistory({ initialEntries: [url] }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.from, url]);
  return <RouterProvider router={router} />;
};
