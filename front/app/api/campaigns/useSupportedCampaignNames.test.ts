import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useSupportedCampaignNames from './useSupportedCampaignNames';

const mockCampaignTypes = [
  'manual_project_participants',
  'project_phase_started',
];
const mockResponseData = {
  data: {
    type: 'supported_campaign_names',
    attributes: mockCampaignTypes,
  },
};

const apiPathPhase = '*/phases/:phaseId/campaigns/supported_campaign_names';
const apiPathProject =
  '*/projects/:projectId/campaigns/supported_campaign_names';
const apiPathGlobal = '*/campaigns/supported_campaign_names';

const server = setupServer(
  http.get(apiPathPhase, () => {
    return HttpResponse.json(mockResponseData, { status: 200 });
  }),
  http.get(apiPathProject, () => {
    return HttpResponse.json(mockResponseData, { status: 200 });
  }),
  http.get(apiPathGlobal, () => {
    return HttpResponse.json(mockResponseData, { status: 200 });
  })
);

describe('useSupportedCampaignNames', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('returns data correctly for phase context', async () => {
    const { result } = renderHook(
      () => useSupportedCampaignNames({ phaseId: 'phase-id' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data.attributes).toEqual(mockCampaignTypes);
  });

  it('returns data correctly for project context', async () => {
    const { result } = renderHook(
      () => useSupportedCampaignNames({ projectId: 'project-id' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data.attributes).toEqual(mockCampaignTypes);
  });

  it('returns data correctly for global context', async () => {
    const { result } = renderHook(() => useSupportedCampaignNames(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data.attributes).toEqual(mockCampaignTypes);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPathPhase, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useSupportedCampaignNames({ phaseId: 'phase-id' }),
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
