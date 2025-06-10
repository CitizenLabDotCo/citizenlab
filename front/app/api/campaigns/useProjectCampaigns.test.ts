import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { campaignsData, links } from './__mocks__/useCampaigns';
import { QueryParameters } from './types';
import useProjectCampaigns from './useProjectCampaigns';

const apiPath = '*/projects/:projectId/email_campaigns';

const params: QueryParameters & {
  projectId: string;
} = {
  projectId: 'project-id',
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: campaignsData, links }, { status: 200 });
  })
);

describe('useProjectCampaigns', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useProjectCampaigns(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(campaignsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useProjectCampaigns(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
