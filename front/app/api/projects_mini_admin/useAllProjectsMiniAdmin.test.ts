import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useAllProjectsMiniAdmin from './useAllProjectsMiniAdmin';

const apiPath = '*projects/for_admin';

const project = (id: string) => ({
  id,
  type: 'project_mini_admin',
  attributes: { title_multiloc: { en: id } },
  relationships: {},
});

const phase = (id: string) => ({ id, type: 'phase', attributes: {} });

const server = setupServer(
  http.get(apiPath, ({ request }) => {
    const pageNumber = new URL(request.url).searchParams.get('page[number]');

    return pageNumber === '1'
      ? HttpResponse.json({
          data: [project('project-1')],
          included: [phase('phase-1')],
          links: { next: 'http://localhost/projects/for_admin?page[number]=2' },
        })
      : HttpResponse.json({
          data: [project('project-2')],
          included: [phase('phase-2')],
          links: { next: null },
        });
  })
);

describe('useAllProjectsMiniAdmin', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('combines every page into one response', async () => {
    const { result } = renderHook(
      () => useAllProjectsMiniAdmin({ sort: 'alphabetically_asc' }),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data.map((p) => p.id)).toEqual([
      'project-1',
      'project-2',
    ]);
    expect(result.current.data?.included?.map((i) => i.id)).toEqual([
      'phase-1',
      'phase-2',
    ]);
  });

  it('fails once when a page fails', async () => {
    let requests = 0;
    server.use(
      http.get(apiPath, () => {
        requests += 1;
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useAllProjectsMiniAdmin({ sort: 'alphabetically_asc' }),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(requests).toBe(1);
  });
});
