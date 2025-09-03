import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { homepageBuilderLayoutData } from './__mocks__/homepageLayout';
import useAddHomepageLayout from './useAddHomepageLayout';

const apiPath = '*home_pages/content_builder_layouts/homepage/upsert';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: homepageBuilderLayoutData },
      { status: 200 }
    );
  })
);

describe('useAddHomepageBuilderLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddHomepageLayout(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(homepageBuilderLayoutData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddHomepageLayout(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
