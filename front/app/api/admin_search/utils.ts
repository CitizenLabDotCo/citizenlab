import { QueryClient } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import { Multiloc } from 'typings';

import adminSearchKeys from './keys';
import { IAdminSearch } from './types';

type UpdatedRecord = {
  id: string;
  titleMultiloc: Multiloc;
  // Only for projects, whose folder shows in their breadcrumbs.
  folderId?: string | null;
};

// What search currently shows for a record, or undefined if it isn't there.
const findShown = (search: IAdminSearch, id: string) => {
  for (const item of search.data) {
    if (item.id === id) {
      return item.type === 'project_admin_search'
        ? {
            titleMultiloc: item.attributes.title_multiloc,
            folderId: item.attributes.folder_id,
          }
        : { titleMultiloc: item.attributes.title_multiloc };
    }

    if (item.type === 'project_admin_search') {
      const phase = item.attributes.phases.find((phase) => phase.id === id);
      if (phase) return { titleMultiloc: phase.title_multiloc };
    }
  }

  return undefined;
};

// Refreshes the admin search after an update only when it changed something
// search shows: the title, or a project's folder. Most saves (e.g. phase
// settings) change neither, and the search list is costly to reload.
export const invalidateAdminSearchIfShownChanged = (
  queryClient: QueryClient,
  { id, titleMultiloc, folderId }: UpdatedRecord
) => {
  const search = queryClient.getQueryData<IAdminSearch>(adminSearchKeys.all());
  // Not loaded yet, so it will be fetched fresh anyway.
  if (!search) return;

  const shown = findShown(search, id);
  const changed =
    !shown ||
    !isEqual(shown.titleMultiloc, titleMultiloc) ||
    (folderId !== undefined && shown.folderId !== folderId);

  if (changed) {
    queryClient.invalidateQueries({ queryKey: adminSearchKeys.all() });
  }
};
