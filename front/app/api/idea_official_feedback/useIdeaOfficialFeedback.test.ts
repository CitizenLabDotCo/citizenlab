import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useIdeaOfficialFeedback from './useIdeaOfficialFeedback';

export const data = [
  {
    type: 'official_feedback',
    id: 'feedbackId1',
    attributes: {
      author_multiloc: {
        en: 'Testing Official Department',
      },
      body_multiloc: {
        en: 'Update: Do Not Keep Calm, please panic now. End of transmission.',
      },
      created_at: '2012-01-01T04:06:07.000Z',
      updated_at: '2011-01-01T04:26:07.000Z',
    },
  },
  {
    type: 'official_feedback',
    id: 'feedbackId2',
    attributes: {
      author_multiloc: {
        en: 'Testing Official Department',
      },
      body_multiloc: {
        en: 'This is an important official communication from the testing department. Keep calm and read on.',
      },
      created_at: '2010-01-01T04:06:07.000Z',
      updated_at: '2000-01-01T04:06:07.000Z',
    },
  },
];

export const links = {
  last: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=9&page%5Bsize%5D=12&sort=random',
  next: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=2&page%5Bsize%5D=12&sort=random',
  self: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  first:
    'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  prev: null,
};

const apiPath = '*ideas/:ideaId/official_feedback';
const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data, links }, { status: 200 });
  })
);

describe('useIdeaOfficialFeedback', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly with next page', async () => {
    const { result } = renderHook(
      () =>
        useIdeaOfficialFeedback({
          pageSize: 1,
          ideaId: 'ideaId',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(data);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('returns data correctly with no next page', async () => {
    const newLinks = { ...links, next: null };
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json({ data, links: newLinks }, { status: 200 });
      })
    );
    const { result } = renderHook(
      () =>
        useIdeaOfficialFeedback({
          pageSize: 1,
          ideaId: 'ideaId',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(data);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useIdeaOfficialFeedback({
          pageSize: 1,
          ideaId: 'ideaId',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
