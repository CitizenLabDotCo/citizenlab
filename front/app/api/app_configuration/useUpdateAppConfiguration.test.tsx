import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useUpdateAppConfiguration from './useUpdateAppConfiguration';

const appConfigurationData = {
  data: {
    id: 'id',
    type: 'app_configuration',
    attributes: {},
  },
};

const apiPath = '*app_configuration';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: appConfigurationData }));
  })
);

describe('useUpdateAppConfiguration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateAppConfiguration(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        settings: {
          core: {
            meta_title: { en: 'meta_title' },
          },
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(appConfigurationData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateAppConfiguration(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        settings: {
          core: {
            meta_title: { en: 'meta_title' },
          },
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
