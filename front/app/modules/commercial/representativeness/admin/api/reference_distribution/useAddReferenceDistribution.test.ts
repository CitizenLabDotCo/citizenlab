import { renderHook, act } from '@testing-library/react-hooks';

import useAddReferenceDistribution from './useAddReferenceDistribution';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IReferenceDistribution } from './types';

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
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
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
