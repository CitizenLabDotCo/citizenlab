import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { projectFolderData } from './__mocks__/useProjectFolder';
import useUpdateProjectFolder from './useUpdateProjectFolder';

const apiPath = '*project_folders/:projectFolderId';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: projectFolderData }, { status: 200 });
  })
);

describe('useUpdateProjectFolder', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateProjectFolder(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        title_multiloc: {
          en: 'new folder test',
          'fr-BE': 'new folder',
          'nl-BE': 'new folder',
          'nl-NL': 'new folder',
        },
        description_multiloc: {
          en: '<p>test</p>',
          'fr-BE': '<p>test</p>',
          'nl-BE': '<p>test</p>',
          'nl-NL': '<p>test</p>',
        },
        admin_publication_attributes: {
          publication_status: 'published',
        },
        projectFolderId: 'projectFolderId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(projectFolderData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateProjectFolder(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        projectFolderId: 'id',
        title_multiloc: { en: 'name' },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
