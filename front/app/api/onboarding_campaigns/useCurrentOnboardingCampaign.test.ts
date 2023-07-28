import { IOnboardingCampaign } from './types';

import { renderHook } from '@testing-library/react-hooks';

import useCurrentOnboardingCampaign from './useCurrentOnboardingCampaign';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const data: IOnboardingCampaign = {
  data: {
    id: 'b869202f-7259-4d60-a5c2-266791f50b0d',
    type: 'onboarding_campaign',
    attributes: {
      name: 'verification',
      cta_message_multiloc: null,
      cta_button_multiloc: null,
      cta_button_link: null,
    },
  },
};
import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/onboarding_campaigns/current';
const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
  })
);

describe('useCurrentOnboardingCampaign', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useCurrentOnboardingCampaign(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useCurrentOnboardingCampaign(),
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
