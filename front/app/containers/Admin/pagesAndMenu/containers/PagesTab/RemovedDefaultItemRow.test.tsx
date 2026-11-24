import React from 'react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { INavbarItem } from 'api/navbar/types';
import { MAX_NAVBAR_ITEMS } from 'api/navbar/util';

import { queryClient } from 'utils/cl-react-query/queryClient';
import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import PagesTab from './';

const buildNavbarItem = (
  id: string,
  code: INavbarItem['attributes']['code'],
  title: string
): INavbarItem => ({
  id,
  type: 'nav_bar_item',
  attributes: {
    title_multiloc: { en: title },
    code,
    slug: null,
    ordering: 0,
    created_at: '2021-12-10T10:36:36.750Z',
    updated_at: '2021-12-10T10:36:36.750Z',
  },
  relationships: {
    static_page: { data: null },
    project: { data: null },
    project_folder: { data: null },
  },
});

let navbarItemsInMenu: INavbarItem[] = [];
let removedDefaultItems: INavbarItem[] = [];
let postedBody: unknown;

const server = setupServer(
  http.get('*/static_pages', () =>
    HttpResponse.json({
      data: [
        {
          id: 'custom-page-id',
          type: 'static_page',
          attributes: {
            code: 'custom',
            slug: 'my-page',
            title_multiloc: { en: 'My custom page' },
          },
        },
      ],
    })
  ),
  http.get('*/nav_bar_items/removed_default_items', () =>
    HttpResponse.json({ data: removedDefaultItems })
  ),
  http.get('*/nav_bar_items', () =>
    HttpResponse.json({ data: navbarItemsInMenu })
  ),
  http.post('*/nav_bar_items', async ({ request }) => {
    postedBody = await request.json();
    return HttpResponse.json({ data: removedDefaultItems[0] });
  })
);

describe('PagesTab removed default items', () => {
  beforeAll(() => server.listen());
  beforeEach(() => {
    queryClient.clear();
    navbarItemsInMenu = [buildNavbarItem('home-id', 'home', 'Home')];
    removedDefaultItems = [buildNavbarItem('events-id', 'events', 'Events')];
  });
  afterEach(() => {
    server.resetHandlers();
    postedBody = undefined;
  });
  afterAll(() => server.close());

  it('restores the native default item when adding it back', async () => {
    render(<PagesTab />);

    await userEvent.click(
      await screen.findByRole('button', { name: /add to menu/i })
    );

    await waitFor(() => expect(postedBody).toBeDefined());
    expect(postedBody).toEqual({
      nav_bar_item: { code: 'events', title_multiloc: { en: 'Events' } },
    });
  });

  it('disables the add button when the navbar is full', async () => {
    navbarItemsInMenu = Array.from({ length: MAX_NAVBAR_ITEMS }, (_, i) =>
      buildNavbarItem(`item-${i}`, 'custom', `Item ${i}`)
    );
    render(<PagesTab />);

    const addButton = await screen.findByRole('button', {
      name: /add to menu/i,
    });
    await waitFor(() =>
      expect(addButton).toHaveAttribute('aria-disabled', 'true')
    );

    await userEvent.click(addButton);
    expect(postedBody).toBeUndefined();
  });

  it('does not offer to add while the navbar items cannot be loaded', async () => {
    server.use(
      http.get('*/nav_bar_items', () => new HttpResponse(null, { status: 500 }))
    );
    render(<PagesTab />);

    await screen.findByText('My custom page');
    expect(
      screen.queryByRole('button', { name: /add to menu/i })
    ).not.toBeInTheDocument();
  });

  it('does not offer to delete a default item', async () => {
    render(<PagesTab />);

    await screen.findByText('Events');
    // Only the custom page has a delete control.
    expect(screen.getAllByRole('button', { name: /delete page/i })).toHaveLength(
      1
    );
    expect(screen.getByText('My custom page')).toBeInTheDocument();
  });

  it('shows no default rows when none were removed', async () => {
    removedDefaultItems = [];
    render(<PagesTab />);

    await screen.findByText('My custom page');
    expect(
      screen.queryByRole('button', { name: /add to menu/i })
    ).not.toBeInTheDocument();
  });
});
