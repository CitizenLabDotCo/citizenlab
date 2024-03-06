import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { questionData } from './__mocks__/useAnalysisQuestion';
import useRegenerateAnalysisQuestion from './useRegenerateAnalysisQuestion';

const apiPath = '*analyses/:analysisId/questions/:questionId/regenerate';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: questionData }));
  })
);

describe('useRegenerateAnalysisQuestion', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useRegenerateAnalysisQuestion(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        analysisId: '1',
        questionId: '2',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(questionData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useRegenerateAnalysisQuestion(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        analysisId: '1',
        questionId: '2',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
