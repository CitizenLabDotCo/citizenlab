import React from 'react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { ICustomPageData } from 'api/custom_pages/types';

import ProjectsByFilter from 'components/CustomPageBuilder/Widgets/ProjectsByFilter';

import { render, waitFor } from 'utils/testUtils/rtl';

import CustomPageProjectsAndEvents from './CustomPageProjectsAndEvents';

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('@craftjs/core', () => ({
  ...jest.requireActual('@craftjs/core'),
  useEditor: () => ({ inBuilder: false }),
}));
jest.mock(
  'components/admin/ContentBuilder/useCraftComponentDefaultPadding',
  () => jest.fn(() => '0px')
);
jest.mock('components/ProjectAndFolderCards/ProjectAndFolderCardsInner', () => ({
  __esModule: true,
  default: () => <div data-testid="cards" />,
}));
jest.mock('components/LandingPages/citizen/EventsWidget', () => ({
  __esModule: true,
  default: () => null,
}));

const statusCounts = {
  data: { type: 'status_counts', attributes: { status_counts: {} } },
};

let statusCountsRequestUrls: URL[] = [];

const server = setupServer(
  http.get('*/admin_publications/status_counts', ({ request }) => {
    statusCountsRequestUrls.push(new URL(request.url));
    return HttpResponse.json(statusCounts, { status: 200 });
  }),
  http.get('*/admin_publications', () =>
    HttpResponse.json(
      { data: [], links: { self: '', next: null } },
      { status: 200 }
    )
  )
);

const page = {
  id: 'page-1',
  attributes: {
    projects_filter_type: 'global_topics',
    projects_enabled: true,
    events_widget_enabled: false,
  },
  relationships: {
    global_topics: { data: [{ id: 'topic-1', type: 'topic' }] },
    areas: { data: [] },
    spaces: { data: [] },
  },
} as unknown as ICustomPageData;

// The card grid asks for `remove_all_unlisted`, so the tab counts have to as well.
// Otherwise admins and moderators see counts that include unlisted projects the grid hides.
describe('custom page project counts', () => {
  beforeAll(() => server.listen());
  beforeEach(() => {
    statusCountsRequestUrls = [];
  });
  afterAll(() => server.close());

  it('excludes unlisted projects from the counts on a legacy custom page', async () => {
    render(<CustomPageProjectsAndEvents page={page} />);

    await waitFor(() => expect(statusCountsRequestUrls).toHaveLength(1));

    expect(
      statusCountsRequestUrls[0].searchParams.get('remove_all_unlisted')
    ).toBe('true');
  });

  it('excludes unlisted projects from the counts in the projects widget', async () => {
    render(<ProjectsByFilter filterType="global_topics" ids={['topic-1']} />);

    await waitFor(() => expect(statusCountsRequestUrls).toHaveLength(1));

    expect(
      statusCountsRequestUrls[0].searchParams.get('remove_all_unlisted')
    ).toBe('true');
  });
});
