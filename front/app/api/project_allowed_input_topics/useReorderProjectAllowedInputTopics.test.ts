import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { projectAllowedInputTopics } from './__mocks__/useProjectAllowedInputTopics';
import useReorderProjectAllowedInputTopics from './useReorderProjectAllowedInputTopics';

const apiPath = '*projects_allowed_input_topics/:id/reorder';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json(
      { data: projectAllowedInputTopics[0] },
      { status: 200 }
    );
  })
);

describe('useReorderProjectAllowedInputTopics', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(
      () => useReorderProjectAllowedInputTopics({ projectId: '1' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        ordering: 1,
        id: 'id',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(projectAllowedInputTopics[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useReorderProjectAllowedInputTopics({ projectId: '1' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );
    act(() => {
      result.current.mutate({
        ordering: 1,
        id: 'id',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
