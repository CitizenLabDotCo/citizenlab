import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { projectAllowedInputTopics } from './__mocks__/useProjectAllowedInputTopics';
import useAddProjectAllowedInputTopic from './useAddProjectAllowedInputTopic';

const apiPath = '*projects_allowed_input_topics';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: projectAllowedInputTopics[0] },
      { status: 200 }
    );
  })
);

describe('useAddProjectAllowedInputTopic', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddProjectAllowedInputTopic(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        project_id: '1',
        topic_id: '1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(projectAllowedInputTopics[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddProjectAllowedInputTopic(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        project_id: '1',
        topic_id: '1',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
