import { renderHook, act } from '@testing-library/react-hooks';

import useUpdateProjectFolder from './useUpdateProjectFolder';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { projectFolderData } from './__mocks__/useProjectFolder';

const apiPath = '*project_folders/:projectFolderId';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: projectFolderData }));
  })
);

describe('useUpdateProjectFolder', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateProjectFolder(), {
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
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateProjectFolder(), {
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
