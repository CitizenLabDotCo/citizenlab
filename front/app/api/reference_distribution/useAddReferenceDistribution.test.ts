import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { IReferenceDistribution } from './types';
import useAddReferenceDistribution from './useAddReferenceDistribution';

const apiPath = '*/users/custom_fields/:id/reference_distribution';

const data: IReferenceDistribution = {
  data: {
    id: '1',
    type: 'binned_distribution',
    attributes: {
      distribution: {
        bins: [1, 2, 3],
        counts: [1, 2, 3],
      },
    },
  },
};

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data }, { status: 200 });
  })
);

describe('useAddReferenceDistribution', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useAddReferenceDistribution(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        id: 'id',
        bins: [1, 2, 3],
        counts: [1, 2, 3],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () => useAddReferenceDistribution(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        id: 'id',
        bins: [1, 2, 3],
        counts: [1, 2, 3],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
