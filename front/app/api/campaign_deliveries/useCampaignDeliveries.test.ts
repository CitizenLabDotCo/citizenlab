import { renderHook } from '@testing-library/react-hooks';

import useCampaignDeliveries from './useCampaignDeliveries';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IDeliveryData } from './types';

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
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: campaignDeliveriesData }));
  })
);

describe('useCampaignDeliveries', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
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
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
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
