import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { emailCampaignsData } from './__mocks__/useEmailCampaigns';
import useAddEmailCampaign from './useAddEmailCampaign';

const apiPath = '*campaigns';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: emailCampaignsData[0] }, { status: 200 });
  })
);

describe('useAddEmailCampaign', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddEmailCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        campaign_name: 'test',
        subject_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
        sender: 'author',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(emailCampaignsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddEmailCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        campaign_name: 'test',
        subject_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
        sender: 'author',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
