import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { campaignsData } from './__mocks__/useCampaigns';
import useSendCampaignPreview from './useSendCampaignPreview';

const apiPath = '*campaigns/:id/send_preview';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: campaignsData[0] }));
  })
);

describe('useSendCampaignPreview', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useSendCampaignPreview(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('campaignId');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(campaignsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useSendCampaignPreview(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('campaignId');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
