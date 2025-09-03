import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { contentBuilderImageData } from './__mocks__/contentBuilderImage';
import useAddContentBuilderImage from './useAddContentBuilderImage';

const apiPath = '*content_builder_layout_images';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: contentBuilderImageData },
      { status: 200 }
    );
  })
);

describe('useAddContentBuilderImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddContentBuilderImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('test_base64');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(contentBuilderImageData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddContentBuilderImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('test_base64');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
