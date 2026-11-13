import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { IAdminSearch } from './types';
import useAdminSearch from './useAdminSearch';

const apiPath = '*admin_search';

const data: IAdminSearch = {
  data: [
    {
      id: 'project-1',
      type: 'project_admin_search',
      attributes: {
        title_multiloc: { en: 'Project' },
        folder_id: null,
        folder_title_multiloc: null,
        phases: [{ id: 'phase-1', title_multiloc: { en: 'Phase' } }],
      },
    },
    {
      id: 'folder-1',
      type: 'folder_admin_search',
      attributes: { title_multiloc: { en: 'Folder' } },
    },
  ],
};

const server = setupServer(
  http.get(apiPath, () => HttpResponse.json(data, { status: 200 }))
);

describe('useAdminSearch', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useAdminSearch(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => HttpResponse.json(null, { status: 500 }))
    );

    const { result } = renderHook(() => useAdminSearch(), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
