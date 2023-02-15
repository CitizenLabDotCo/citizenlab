import { renderHook, act } from '@testing-library/react-hooks';

import useCreateView from './useCreateView';
import views from '../../fixtures/views';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const server = setupServer(
  rest.post('*insights/views', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: views[0] }));
  })
);

describe('useCreateView', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useCreateView(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        view: {
          name: 'Name',
          data_sources: [{ origin_id: 'id' }],
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(views[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post('*insights/views', (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useCreateView(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        view: {
          name: 'Name',
          data_sources: [{ origin_id: 'id' }],
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
