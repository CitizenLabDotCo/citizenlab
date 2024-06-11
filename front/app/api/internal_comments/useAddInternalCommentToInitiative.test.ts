import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { commentsData } from './__mocks__/useInternalComments';
import useAddInternalCommentToInitiative from './useAddInternalCommentToInitiative';

const apiPath = '*/initiatives/:initiativeId/internal_comments';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: commentsData[0] }, { status: 200 });
  })
);

describe('useAddInternalCommentToInitiative', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useAddInternalCommentToInitiative(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        initiativeId: 'initiativeId',
        author_id: 'author_id',
        body: 'body_text',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(commentsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () => useAddInternalCommentToInitiative(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        initiativeId: 'initiativeId',
        author_id: 'author_id',
        body: 'body_text',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
