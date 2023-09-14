import { renderHook, act } from '@testing-library/react-hooks';

import useAddAnalysisTagging from './useAddAnalysisTagging';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { taggingsData } from './__mocks__/useAnalysisTaggings';

const apiPath = '*analyses/:analysisId/taggings';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: taggingsData[0] }));
  })
);

describe('useAddAnalysisTagging', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddAnalysisTagging(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        inputId: 'inputId',
        tagId: 'tagId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(taggingsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddAnalysisTagging(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        inputId: 'inputId',
        tagId: 'tagId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
