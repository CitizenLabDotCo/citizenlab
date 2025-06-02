import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useDismissOnboardingCampaign from './useDismissOnboardingCampaign';

const apiPath = '*/onboarding_campaigns/verification/dismissal';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDismissOnboardingCampaign', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useDismissOnboardingCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('verification');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDismissOnboardingCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('verification');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
