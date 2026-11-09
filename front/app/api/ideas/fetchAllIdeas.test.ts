import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { apiPathIdeas, ideaData } from './__mocks__/_mockServer';
import fetchAllIdeas from './fetchAllIdeas';

const server = setupServer(
  http.get(apiPathIdeas, ({ request }) => {
    const page = new URL(request.url).searchParams.get('page[number]');

    return HttpResponse.json({
      data: [ideaData[page === '1' ? 0 : 1]],
      links: { next: page === '1' ? 'next-page' : null },
    });
  })
);

describe('fetchAllIdeas', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('collects the ideas of every page', async () => {
    const ideas = await fetchAllIdeas({ projects: ['project-id'] });

    expect(ideas).toEqual([ideaData[0], ideaData[1]]);
  });
});
