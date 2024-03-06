import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { reportLayout, apiPathUpdate } from './__mocks__/_mockServer';
import useUpdateReportLayout from './useUpdateReportLayout';

const server = setupServer(
  rest.patch(apiPathUpdate, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(reportLayout));
  })
);

describe('useUpdateReportLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateReportLayout(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
        craftjs_json: {},
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(reportLayout.data);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPathUpdate, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateReportLayout(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        id: 'id',
        craftjs_json: {},
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
