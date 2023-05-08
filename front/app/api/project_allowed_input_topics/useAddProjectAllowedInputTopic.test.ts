import { renderHook, act } from '@testing-library/react-hooks';

import useAddProjectAllowedInputTopic from './useAddProjectAllowedInputTopic';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { projectAllowedInputTopics } from './__mocks__/useProjectAllowedInputTopics';

const apiPath = '*projects_allowed_input_topics';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: projectAllowedInputTopics[0] })
    );
  })
);

describe('useAddProjectAllowedInputTopic', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useAddProjectAllowedInputTopic(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useAddProjectAllowedInputTopic(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

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
