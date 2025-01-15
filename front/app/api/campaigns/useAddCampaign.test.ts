import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { campaignsData } from './__mocks__/useCampaigns';
import useAddCampaign from './useAddCampaign';

const apiPath = '*campaigns';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: campaignsData[0] }, { status: 200 });
  })
);

describe('useAddCampaign', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        campaign_name: 'test',
        subject_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
        sender: 'author',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(campaignsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        campaign_name: 'test',
        subject_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
        sender: 'author',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
