import React from 'react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { INavbarItem } from 'api/navbar/types';

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

const navbarItemsInMenu = [
  buildNavbarItem('home-id', 'home', 'Home'),
  buildNavbarItem('all-input-id', 'all_input', 'All input'),
];
const removedDefaultItems = [
  buildNavbarItem('projects-id', 'projects', 'All projects'),
  buildNavbarItem('events-id', 'events', 'Events'),
];

let postedBody: unknown;

const server = setupServer(
  http.get('*/static_pages', () => HttpResponse.json({ data: [] })),
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

describe('PagesTab', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    postedBody = undefined;
  });
  afterAll(() => server.close());

  it('lists a removed default navbar item and lets the admin add it back to the menu', async () => {
    render(<PagesTab />);

    expect(await screen.findByText('All projects')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();

    const addButtons = screen.getAllByRole('button', { name: /add to menu/i });
    expect(addButtons).toHaveLength(2);

    await userEvent.click(addButtons[0]);

    await waitFor(() => expect(postedBody).toBeDefined());
    expect(postedBody).toEqual({
      nav_bar_item: {
        code: 'projects',
        title_multiloc: { en: 'All projects' },
      },
    });
  });
});
