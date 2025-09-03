import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useCampaignConsents from './useCampaignConsents';

const apiPath = '*consents';

const campaignConsentData = {
  data: {
    type: 'consent',
    attributes: {
      campaign_name: 'test',
      campaign_type_description_multiloc: {},
      content_type_multiloc: {},
      consented: true,
    },
  },
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: campaignConsentData }, { status: 200 });
  })
);

describe('useCampaignConsents', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useCampaignConsents(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(campaignConsentData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useCampaignConsents(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
