import { renderHook, act } from '@testing-library/react-hooks';

import useUpdateCampaignConsents from './useUpdateCampaignConsents';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

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
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: campaignConsentData }));
  })
);

describe('useUpdateCampaignConsents', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateCampaignConsents(), {
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
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateCampaignConsents(), {
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
