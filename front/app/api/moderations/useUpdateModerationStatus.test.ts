import { renderHook, act } from '@testing-library/react-hooks';

import useUpdateModerationStatus from './useUpdateModerationStatus';
import { moderationsData } from './__mocks__/useModerations';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*moderations/:moderatableType/:moderationId';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: moderationsData[0] }));
  })
);

describe('useUpdateModerationStatus', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateModerationStatus(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        moderatableType: 'Idea',
        moderationId: 'id',
        moderationStatus: 'read',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(moderationsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateModerationStatus(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        moderatableType: 'Idea',
        moderationId: 'id',
        moderationStatus: 'read',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
