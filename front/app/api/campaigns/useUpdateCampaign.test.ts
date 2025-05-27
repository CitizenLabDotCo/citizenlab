import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { campaignsData } from './__mocks__/useCampaigns';
import useUpdateCampaign from './useUpdateCampaign';

const apiPath = '*campaigns/:id';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: campaignsData[0] }, { status: 200 });
  })
);

describe('useUpdateCampaign', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
        campaign: { enabled: false },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(campaignsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateCampaign(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        id: 'id',
        campaign: { enabled: false },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
