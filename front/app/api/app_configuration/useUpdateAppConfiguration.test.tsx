import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

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
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: appConfigurationData }, { status: 200 });
  })
);

describe('useUpdateAppConfiguration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateAppConfiguration(), {
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
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateAppConfiguration(), {
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
