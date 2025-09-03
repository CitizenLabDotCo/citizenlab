import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { projectAllowedInputTopics } from './__mocks__/useProjectAllowedInputTopics';
import useProjectAllowedInputTopics from './useProjectAllowedInputTopics';

const apiPath = '*/projects/:projectId/projects_allowed_input_topics';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: projectAllowedInputTopics },
      { status: 200 }
    );
  })
);

describe('useProjectAllowedInputTopics', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () => useProjectAllowedInputTopics({ projectId: '1' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(projectAllowedInputTopics);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useProjectAllowedInputTopics({ projectId: '1' }),
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
