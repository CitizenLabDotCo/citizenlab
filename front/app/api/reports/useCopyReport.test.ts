import { renderHook, act } from '@testing-library/react-hooks';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import { apiPathReport, reportsData } from './__mocks__/_mockServer';

import useCopyReport from './useCopyReport';

const reportData = reportsData[0];
const apiCopyPath = apiPathReport + '/copy';

const server = setupServer(
  rest.post(apiCopyPath, (_req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ data: reportData }));
  })
);

describe('useCopyReport', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useCopyReport(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.data).toBeUndefined();

    act(() => result.current.mutate({ id: '0' })); // the id doesn't matter

    await waitFor(() => result.current.isSuccess);
    expect(result.current.data?.data).toEqual(reportData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiCopyPath, (_req, res, ctx) => res(ctx.status(500)))
    );

    const { result, waitFor } = renderHook(() => useCopyReport(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.error).toBeNull();

    act(() => result.current.mutate({ id: '0' }));

    await waitFor(() => result.current.isError);
    expect(result.current.error).toBeDefined();
  });
});
