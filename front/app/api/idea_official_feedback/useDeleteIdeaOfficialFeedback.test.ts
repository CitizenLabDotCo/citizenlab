import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteIdeaOfficialFeedback from './useDeleteIdeaOfficialFeedback';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
const apiPath = '*official_feedback/:id';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteIdeaOfficialFeedback', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useDeleteIdeaOfficialFeedback(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate('id');
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useDeleteIdeaOfficialFeedback(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate('id');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
