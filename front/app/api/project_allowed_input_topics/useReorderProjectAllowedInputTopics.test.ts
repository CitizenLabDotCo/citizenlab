import { renderHook, act } from '@testing-library/react-hooks';

import useReorderProjectAllowedInputTopics from './useReorderProjectAllowedInputTopics';
import { projectAllowedInputTopics } from './__mocks__/useProjectAllowedInputTopics';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*projects_allowed_input_topics/:id/reorder';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: projectAllowedInputTopics[0] })
    );
  })
);

describe('useReorderProjectAllowedInputTopics', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
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
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
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
