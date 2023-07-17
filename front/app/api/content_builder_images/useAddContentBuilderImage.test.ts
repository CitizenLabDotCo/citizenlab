import { renderHook, act } from '@testing-library/react-hooks';

import useAddContentBuilderImage from './useAddContentBuilderImage';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { contentBuilderImageData } from './__mocks__/contentBuilderImage';

const apiPath = '*content_builder_layout_images';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: contentBuilderImageData }));
  })
);

describe('useAddContentBuilderImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddContentBuilderImage(), {
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddContentBuilderImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('test_base64');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
