import { renderHook, act } from '@testing-library/react-hooks';

import useUpdateIdeaOfficialFeedback from './useUpdateIdeaOfficialFeedback';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { data } from './useIdeaOfficialFeedback.test';

const apiPath = '*official_feedback/:id';

const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: data[0] }));
  })
);

describe('useUpdateIdeaOfficialFeedback', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useUpdateIdeaOfficialFeedback(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        id: 'id',
        requestBody: {
          body_multiloc: {
            en: 'test',
          },
          author_multiloc: {
            en: 'authod',
          },
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(data[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useUpdateIdeaOfficialFeedback(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        id: 'id',
        requestBody: {
          body_multiloc: {
            en: 'test',
          },
          author_multiloc: {
            en: 'authod',
          },
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
