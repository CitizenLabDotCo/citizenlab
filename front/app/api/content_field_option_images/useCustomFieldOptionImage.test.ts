import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { customFieldOptionImageData } from './__mocks__/customFieldOptionImage';
import useCustomFieldOptionImage from './useCustomFieldOptionImage';

const apiPath = '*/custom_field_option_images/:imageId';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: customFieldOptionImageData },
      { status: 200 }
    );
  })
);

describe('useCustomFieldOptionImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () => useCustomFieldOptionImage({ imageId: 'test_id ' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(customFieldOptionImageData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useCustomFieldOptionImage({ imageId: 'test_id ' }),
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
