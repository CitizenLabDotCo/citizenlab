import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { IIdeasByProject } from './types';
import useIdeasByProject from './useIdeasByProject';

const apiPath = `*stats/ideas_by_project`;

const data: IIdeasByProject = {
  data: {
    type: 'ideas_by_project',
    attributes: {
      series: {
        ideas: {
          '0-17': 10,
          '18-24': 20,
          '25-34': 30,
        },
      },
      projects: {
        project: {
          title_multiloc: {
            en: 'project',
          },
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

describe('useIdeasByProject', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () =>
        useIdeasByProject({
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
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useIdeasByProject({
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
