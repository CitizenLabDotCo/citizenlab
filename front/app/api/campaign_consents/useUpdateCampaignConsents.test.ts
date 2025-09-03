import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useUpdateCampaignConsents from './useUpdateCampaignConsents';

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

const apiPath = '*consents/:id';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: campaignConsentData }, { status: 200 });
  })
);

describe('useUpdateCampaignConsents', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateCampaignConsents(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        consentChanges: [
          {
            campaignConsentId: 'id',
            consented: true,
          },
        ],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([{ data: campaignConsentData }]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateCampaignConsents(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        consentChanges: [
          {
            campaignConsentId: 'id',
            consented: true,
          },
        ],
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
