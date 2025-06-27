import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { ICommentsByTopic } from './types';
import useCommentsByTopic from './useCommentsByTopic';

const apiPath = `*stats/comments_by_topic`;

const data: ICommentsByTopic = {
  data: {
    type: 'comments_by_topic',
    attributes: {
      series: {
        comments: {
          '0-17': 10,
          '18-24': 20,
          '25-34': 30,
        },
      },
      topics: {
        topic: {
          title_multiloc: {
            en: 'topic',
          },
        },
      },
    },
  },
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data }, { status: 200 });
  })
);

describe('useCommentsByTopic', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () =>
        useCommentsByTopic({
          project: 'project',
          enabled: true,
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useCommentsByTopic({
          project: 'project',
          enabled: true,
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
