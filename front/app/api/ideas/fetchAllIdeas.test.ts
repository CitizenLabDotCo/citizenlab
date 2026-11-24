import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { apiPathIdeas, ideaData } from './__mocks__/_mockServer';
import fetchAllIdeas from './fetchAllIdeas';

const lastPageLink = (page: number) =>
  `http://localhost/web_api/v1/ideas?page%5Bnumber%5D=${page}&page%5Bsize%5D=100`;

const server = setupServer(
  http.get(apiPathIdeas, ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get('page[number]'));

    return HttpResponse.json({
      data: [{ ...ideaData[0], id: `idea-${page}` }],
      links: { last: lastPageLink(3) },
    });
  })
);

describe('fetchAllIdeas', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('collects the ideas of every page, in page order', async () => {
    const ideas = await fetchAllIdeas({ projects: ['project-id'] });

    expect(ideas.map((idea) => idea.id)).toEqual([
      'idea-1',
      'idea-2',
      'idea-3',
    ]);
  });
});
