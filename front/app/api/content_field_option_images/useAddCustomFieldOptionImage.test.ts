import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { customFieldOptionImageData } from './__mocks__/customFieldOptionImage';
import useAddCustomFieldOptionImage from './useAddCustomFieldOptionImage';

const apiPath = '*custom_field_option_images';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: customFieldOptionImageData },
      { status: 200 }
    );
  })
);

describe('useAddCustomFieldOptionImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddCustomFieldOptionImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('test_base64');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(customFieldOptionImageData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddCustomFieldOptionImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('test_base64');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
