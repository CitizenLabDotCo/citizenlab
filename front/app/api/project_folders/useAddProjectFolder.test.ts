import { renderHook, act } from '@testing-library/react-hooks';

import useAddProjectFolder from './useAddProjectFolder';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { projectFolderData } from './__mocks__/useProjectFolder';

const apiPath = '*project_folders';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: projectFolderData }));
  })
);

describe('useAddProjectFolder', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddProjectFolder(), {
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddProjectFolder(), {
      wrapper: createQueryClientWrapper(),
    });

    act(async () => {
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

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });
});
