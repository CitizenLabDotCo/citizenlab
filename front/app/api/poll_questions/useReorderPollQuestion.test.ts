import { renderHook, act } from '@testing-library/react-hooks';

import useReorderPollQuestion from './useReorderPollQuestion';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { pollQuestionsData } from './__mocks__/usePollQuestions';

const apiPath = '*/poll_questions/:questionId/reorder';

const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: pollQuestionsData[0] }));
  })
);

describe('useReorderPollQuestion', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useReorderPollQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        questionId: 'questionId',
        ordering: 1,
        phaseId: '1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(pollQuestionsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useReorderPollQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        questionId: 'questionId',
        ordering: 1,
        phaseId: '1',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
