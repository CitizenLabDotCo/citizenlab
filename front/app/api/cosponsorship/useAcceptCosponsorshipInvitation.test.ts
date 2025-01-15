import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { cosponsorshipData } from './__mocks__/useCosponsorships';
import useAcceptCosponsorshipInvitation from './useAcceptCosponsorshipInvitation';

const apiPath = '*cosponsorships/:id/accept';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: cosponsorshipData[0] }, { status: 200 });
  })
);

describe('useAcceptCosponsorshipInvitation', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAcceptCosponsorshipInvitation(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        id: 'id',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(cosponsorshipData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAcceptCosponsorshipInvitation(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        id: 'id',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
