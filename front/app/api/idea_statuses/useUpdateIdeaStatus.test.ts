import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { ideaStatusesData } from './__mocks__/_mockServer';
import useUpdateIdeaStatus from './useUpdateIdeaStatus';

const apiPath = '*idea_statuses/:id';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideaStatusesData[0] }));
  })
);

describe('useUpdateIdeaStatus', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateIdeaStatus(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
        requestBody: { title_multiloc: { en: 'name' }, color: '#000000' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(ideaStatusesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateIdeaStatus(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        id: 'id',
        requestBody: { title_multiloc: { en: 'name' }, color: '#000000' },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
