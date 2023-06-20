import { renderHook, act } from '@testing-library/react-hooks';

import useAddUserCustomField from './useAddUserCustomField';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { userCustomFieldsData } from './__mocks__/useUserCustomFields';

const apiPath = '*/users/custom_fields';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: userCustomFieldsData }));
  })
);

describe('useAddUserCustomField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddUserCustomField(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        title_multiloc: { en: 'mock title' },
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(userCustomFieldsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddUserCustomField(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        title_multiloc: { en: 'mock title' },
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
