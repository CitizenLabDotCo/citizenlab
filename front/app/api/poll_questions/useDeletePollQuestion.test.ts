import { renderHook, act } from '@testing-library/react-hooks';

import useDeletePollQuestion from './useDeletePollQuestion';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/poll_questions/:questionId';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeletePollQuestion', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeletePollQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        questionId: 'questionId',
        phaseId: '1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeletePollQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        questionId: 'questionId',
        phaseId: '1',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
