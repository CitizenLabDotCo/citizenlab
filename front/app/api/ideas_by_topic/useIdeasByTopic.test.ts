import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { IIdeasByTopic } from './types';
import useIdeasByTopic from './useIdeasByTopic';

const apiPath = `*stats/ideas_by_topic`;

const data: IIdeasByTopic = {
  data: {
    type: 'ideas_by_topic',
    attributes: {
      series: {
        ideas: {
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
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
  })
);

describe('useIdeasByTopic', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useIdeasByTopic({
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
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useIdeasByTopic({
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
