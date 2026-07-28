import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { emailCampaignsData, links } from './__mocks__/useEmailCampaigns';
import { EmailCampaignsQueryParameters } from './types';
import useEmailCampaigns from './useEmailCampaigns';

const apiPath = '*/campaigns';

const params: EmailCampaignsQueryParameters = {};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: emailCampaignsData, links },
      { status: 200 }
    );
  })
);

describe('useEmailCampaigns', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useEmailCampaigns(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(emailCampaignsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEmailCampaigns(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
