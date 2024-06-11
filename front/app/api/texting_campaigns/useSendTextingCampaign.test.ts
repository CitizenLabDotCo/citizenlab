import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { campaignsData } from './__mocks__/useTextingCampaigns';
import useSendTextingCampaign from './useSendTextingCampaign';

const apiPath = '*texting_campaigns/:id/send';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: campaignsData[0] }, { status: 200 });
  })
);

describe('useSendTextingCampaign', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useSendTextingCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: '1' });
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

    const { result, waitFor } = renderHook(() => useSendTextingCampaign(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({ id: '1' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
