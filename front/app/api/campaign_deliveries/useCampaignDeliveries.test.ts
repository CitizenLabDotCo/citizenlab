import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { IDeliveryData } from './types';
import useCampaignDeliveries from './useCampaignDeliveries';

const apiPath = '*campaigns/:id/deliveries';

const campaignDeliveriesData: IDeliveryData = {
  id: '1',
  type: 'campaign_delivery',
  attributes: {
    delivery_status: 'sent',
    sent_at: '2021-06-01T09:00:00.000Z',
    created_at: '2021-06-01T09:00:00.000Z',
    updated_at: '2021-06-01T09:00:00.000Z',
  },
  relationships: {
    user: {
      data: {
        id: '1',
        type: 'user',
      },
    },
  },
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: campaignDeliveriesData }, { status: 200 });
  })
);

describe('useCampaignDeliveries', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () =>
        useCampaignDeliveries({
          campaignId: 'campaignId',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(campaignDeliveriesData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useCampaignDeliveries({
          campaignId: 'campaignId',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
