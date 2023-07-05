import { renderHook, act } from '@testing-library/react-hooks';

import useAddTextingCampaign from './useAddTextingCampaign';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { campaignsData } from './__mocks__/useTextingCampaigns';

const apiPath = '*texting_campaigns';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: campaignsData[0] }));
  })
);

describe('useAddTextingCampaign', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddTextingCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        message: 'test',
        phone_numbers: ['0000000'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(campaignsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddTextingCampaign(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        message: 'test',
        phone_numbers: ['0000000'],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
