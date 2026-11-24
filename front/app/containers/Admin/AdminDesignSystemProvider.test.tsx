import React from 'react';

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  retainSearchParams,
  RouterProvider,
} from '@tanstack/react-router';

import Breadcrumbs, { Breadcrumb } from 'design-system/Breadcrumbs';
import Link from 'design-system/Link';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import AdminDesignSystemProvider from './AdminDesignSystemProvider';

jest.mock('hooks/useLocale', () => () => 'fr-FR');

it('keeps the locale and preview flag in admin links and uses client navigation', async () => {
  const root = createRootRoute({
    validateSearch: (search) => search,
    search: {
      middlewares: [
        retainSearchParams<Record<string, unknown>>([
          'project_backoffice_redesign',
        ]),
      ],
    },
    component: () => (
      <AdminDesignSystemProvider>
        <Breadcrumbs separator="slash">
          <Breadcrumb href="/admin/projects?from=review#setup">
            Projects
          </Breadcrumb>
          <Breadcrumb>Phase</Breadcrumb>
        </Breadcrumbs>
        <Link href="https://example.org/support" target="_blank">
          Support
        </Link>
      </AdminDesignSystemProvider>
    ),
  });

  const admin = createRoute({
    getParentRoute: () => root,
    path: '/$locale/admin/$',
  });

  const history = createMemoryHistory({
    initialEntries: [
      '/fr-FR/admin/projects/example/phase?project_backoffice_redesign=1&temporary=1',
    ],
  });
  const router = createRouter({
    routeTree: root.addChildren([admin]),
    history,
  });
  await router.load();
  render(<RouterProvider router={router} />);

  const breadcrumb = await screen.findByRole('link', { name: 'Projects' });
  const href = breadcrumb.getAttribute('href');
  expect(href).toBe(
    '/fr-FR/admin/projects?from=review&project_backoffice_redesign=1#setup'
  );
  expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute(
    'href',
    'https://example.org/support'
  );

  await userEvent.click(breadcrumb);
  await waitFor(() => expect(history.location.href).toBe(href));
});
