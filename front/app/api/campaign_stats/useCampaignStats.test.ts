import { renderHook } from '@testing-library/react-hooks';

import useCampaignStats from './useCampaignStats';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { ICampaignStats } from './types';

const apiPath = '*campaigns/:id/stats';

const campaignStatsData: ICampaignStats = {
  data: {
    type: 'stats',
    attributes: {
      sent: 1,
      bounced: 0,
      failed: 0,
      accepted: 1,
      delivered: 1,
      opened: 0,
      clicked: 0,
      total: 1,
    },
  },
};

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: campaignStatsData }));
  })
);

describe('useCampaignStats', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useCampaignStats('campaignId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(campaignStatsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useCampaignStats('campaignId'),
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
