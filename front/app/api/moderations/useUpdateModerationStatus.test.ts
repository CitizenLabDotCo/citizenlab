import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { moderationsData } from './__mocks__/useModerations';
import useUpdateModerationStatus from './useUpdateModerationStatus';

const apiPath = '*moderations/:moderatableType/:moderationId';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: moderationsData[0] }, { status: 200 });
  })
);

describe('useUpdateModerationStatus', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateModerationStatus(), {
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
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateModerationStatus(), {
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
