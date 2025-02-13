import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { projectFolderData } from './__mocks__/useProjectFolder';
import useAddProjectFolder from './useAddProjectFolder';

const apiPath = '*project_folders';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: projectFolderData }, { status: 200 });
  })
);

describe('useAddProjectFolder', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddProjectFolder(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        title_multiloc: {
          en: 'new folder',
          'nl-BE': 'new folder',
          'nl-NL': 'new folder',
          'fr-BE': 'new folder',
        },
        slug: null,
        description_multiloc: {
          'fr-BE': '<p> </p>',
          'nl-NL': '<p> </p>',
          'nl-BE': '<p> </p>',
          en: '<p> </p>',
        },
        description_preview_multiloc: {
          en: ' ',
          'nl-BE': ' ',
          'nl-NL': ' ',
          'fr-BE': ' ',
        },
        header_bg: null,
        admin_publication_attributes: {
          publication_status: 'published',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(projectFolderData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddProjectFolder(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        title_multiloc: {
          en: 'new folder',
          'nl-BE': 'new folder',
          'nl-NL': 'new folder',
          'fr-BE': 'new folder',
        },
        slug: null,
        description_multiloc: {
          'fr-BE': '<p> </p>',
          'nl-NL': '<p> </p>',
          'nl-BE': '<p> </p>',
          en: '<p> </p>',
        },
        description_preview_multiloc: {
          en: ' ',
          'nl-BE': ' ',
          'nl-NL': ' ',
          'fr-BE': ' ',
        },
        header_bg: null,
        admin_publication_attributes: {
          publication_status: 'published',
        },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
