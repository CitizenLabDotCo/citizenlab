import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { campaignExamplesData } from './__mocks__/useEmailCampaignExamples';
import { ICampaignExampleParameters } from './types';
import useEmailCampaignExamples from './useEmailCampaignExamples';

const apiPath = '*/campaigns/:id/examples';

const params: ICampaignExampleParameters = {
  campaignId: '1',
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: campaignExamplesData }, { status: 200 });
  })
);

describe('useEmailCampaignExamples', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useEmailCampaignExamples(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(campaignExamplesData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEmailCampaignExamples(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
