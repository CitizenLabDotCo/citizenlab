import { QueryClient } from '@tanstack/react-query';

import adminSearchKeys from './keys';
import { IAdminSearch } from './types';
import { invalidateAdminSearchIfShownChanged } from './utils';

const search: IAdminSearch = {
  data: [
    {
      id: 'project-1',
      type: 'project_admin_search',
      attributes: {
        title_multiloc: { en: 'Project' },
        folder_id: 'folder-1',
        folder_title_multiloc: { en: 'Folder' },
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

const setup = (data?: IAdminSearch) => {
  const queryClient = new QueryClient();
  if (data) queryClient.setQueryData(adminSearchKeys.all(), data);
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
  return { queryClient, invalidate };
};

describe('invalidateAdminSearchIfShownChanged', () => {
  it('does nothing when the title is unchanged', () => {
    const { queryClient, invalidate } = setup(search);

    invalidateAdminSearchIfShownChanged(queryClient, {
      id: 'phase-1',
      titleMultiloc: { en: 'Phase' },
    });
    invalidateAdminSearchIfShownChanged(queryClient, {
      id: 'project-1',
      titleMultiloc: { en: 'Project' },
      folderId: 'folder-1',
    });

    expect(invalidate).not.toHaveBeenCalled();
  });

  it('refreshes when a title changed', () => {
    const { queryClient, invalidate } = setup(search);

    invalidateAdminSearchIfShownChanged(queryClient, {
      id: 'phase-1',
      titleMultiloc: { en: 'Renamed phase' },
    });

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: adminSearchKeys.all(),
    });
  });

  it("refreshes when a project's folder changed", () => {
    const { queryClient, invalidate } = setup(search);

    invalidateAdminSearchIfShownChanged(queryClient, {
      id: 'project-1',
      titleMultiloc: { en: 'Project' },
      folderId: null,
    });

    expect(invalidate).toHaveBeenCalled();
  });

  it('refreshes when the record is not in search yet', () => {
    const { queryClient, invalidate } = setup(search);

    invalidateAdminSearchIfShownChanged(queryClient, {
      id: 'unknown',
      titleMultiloc: { en: 'New' },
    });

    expect(invalidate).toHaveBeenCalled();
  });

  it('does nothing when search has not loaded', () => {
    const { queryClient, invalidate } = setup();

    invalidateAdminSearchIfShownChanged(queryClient, {
      id: 'phase-1',
      titleMultiloc: { en: 'Renamed phase' },
    });

    expect(invalidate).not.toHaveBeenCalled();
  });
});
