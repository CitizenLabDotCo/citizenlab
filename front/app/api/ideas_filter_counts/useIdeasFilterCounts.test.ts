import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { IIdeasFilterCounts } from './types';
import useIdeasFilterCounts from './useIdeasFilterCounts';

export const data: IIdeasFilterCounts = {
  data: {
    type: 'filter_counts',
    attributes: {
      idea_status_id: {
        '1f3d57f5-c7e8-4aca-8e0e-5823627e6cce': 4,
        '613a20a5-63d7-469f-b2a2-c616589c224f': 3,
      },
      area_id: {
        '0aff82f6-92e0-4174-89bf-a260220b92fe': 1,
        '23918a1c-c3b4-424c-b7ac-6aae738f16a8': 1,
        '3916fe24-83e4-428b-8926-335e74dac9fc': 1,
      },
      topic_id: {
        '0f34479a-de63-4df4-a0cc-b165751a1ae4': 1,
        '32e9b529-c821-49d6-b86c-1a4ff62317fc': 1,
        'b77ad2ff-16a0-4721-a9cc-be27efd1f717': 1,
        'c0ba47fe-bbe0-4bc0-9312-cf88314274c9': 2,
      },
      total: 7,
    },
  },
};

const apiPath = '*ideas/filter_counts';
const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data }, { status: 200 });
  })
);

describe('useIdeasFilterCounts', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () =>
        useIdeasFilterCounts({
          search: '',
        }),
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
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useIdeasFilterCounts({
          search: '',
        }),
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
