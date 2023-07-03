import useUsersByGender from './useUsersByGender';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IUsersByCustomField } from 'api/users_by_custom_field/types';

const apiPath = `*stats/users_by_gender`;

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
        expected_users: null,
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
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
  })
);

describe('useUsersByGender', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useUsersByGender({
          project: 'project',
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
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useUsersByGender({
          project: 'project',
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
