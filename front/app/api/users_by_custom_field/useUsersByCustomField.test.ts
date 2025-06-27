import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { IUsersByCustomField } from './types';
import useUsersByCustomField from './useUsersByCustomField';

const apiPath = `*stats/users_by_custom_field/:id`;

const data: IUsersByCustomField = {
  data: {
    type: 'users_by_custom_field',
    attributes: {
      series: {
        users: {
          male: 5,
          female: 2,
          unspecified: 1,
          _blank: 3,
        },
        reference_population: null,
      },
      options: {
        male: {
          title_multiloc: {
            en: 'Male',
          },
          ordering: 0,
        },
        female: {
          title_multiloc: {
            en: 'Female',
          },
          ordering: 1,
        },
        unspecified: {
          title_multiloc: {
            en: 'Other',
          },
          ordering: 2,
        },
      },
    },
  },
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data }, { status: 200 });
  })
);

describe('useUsersByCustomField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () =>
        useUsersByCustomField({
          id: 'id',
          enabled: true,
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useUsersByCustomField({
          id: 'id',
          enabled: true,
        }),
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
