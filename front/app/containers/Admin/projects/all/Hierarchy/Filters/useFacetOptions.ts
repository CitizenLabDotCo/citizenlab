import useAuthUser from 'api/me/useAuthUser';
import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';
import { visibilities } from 'api/projects/types';
import { displayStatuses } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import useManagerOptions from '../../_shared/FilterBar/Filters/useManagerOptions';
import useParticipationMethodOptions from '../../_shared/FilterBar/Filters/useParticipationMethodOptions';
import useSpaceOptions from '../../_shared/FilterBar/Filters/useSpaceOptions';
import projectsMessages from '../../Projects/Table/messages';
import { ACCESS_MESSAGES, STATUS_MESSAGES } from '../labels';
import { Level } from '../level';
import messages from '../messages';

import { ListFacetKey, STATE_CHOICES } from './facets';

// One choice in a filter. It can stand for several values: "Open" is both
// participation states where a phase is running.
export type FacetOption = { label: string; values: string[] };

// Large enough for every folder a manager can see, so the list is complete.
const FOLDERS_PAGE_SIZE = 1000;

const single = (value: string, label: string): FacetOption => ({
  label,
  values: [value],
});

// The choices of the filters in `keys`. Only those filters' lists are loaded.
const useFacetOptions = (keys: ListFacetKey[], level: Level) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const canSeePending = usePermission({
    item: 'project',
    action: 'list_pending_review',
  });

  const managers = useManagerOptions({ enabled: keys.includes('managers') });
  const methods = useParticipationMethodOptions();
  const spaces = useSpaceOptions({
    enabled: keys.includes('space_ids'),
  });
  // Inside a space, only the folders in it.
  const folders = useInfiniteProjectFoldersAdmin(
    level.kind === 'space' ? { space_ids: [level.id] } : {},
    FOLDERS_PAGE_SIZE,
    { enabled: keys.includes('folder_ids') }
  );

  const myId = authUser?.data.id;
  const folderOptions = (folders.data?.pages[0].data ?? [])
    .map((folder) =>
      single(folder.id, localize(folder.attributes.title_multiloc))
    )
    .sort((a, b) => a.label.localeCompare(b.label));

  const options: Record<ListFacetKey, FacetOption[]> = {
    // The current user comes first, as "You".
    managers: [
      ...(myId ? [single(myId, formatMessage(messages.you))] : []),
      ...managers.options
        .filter((manager) => manager.value !== myId)
        .map((manager) => single(manager.value, manager.label)),
    ],
    display_status: displayStatuses
      .filter((status) => status !== 'pending' || canSeePending)
      .map((status) => single(status, formatMessage(STATUS_MESSAGES[status]))),
    folder_ids: folderOptions,
    participation_states: [
      {
        label: formatMessage(messages.stateOpen),
        values: STATE_CHOICES.open,
      },
      {
        label: formatMessage(messages.startingSoon),
        values: STATE_CHOICES.startingSoon,
      },
      {
        label: formatMessage(projectsMessages.ended),
        values: STATE_CHOICES.ended,
      },
      {
        label: formatMessage(messages.noPhasesYet),
        values: STATE_CHOICES.noPhases,
      },
    ],
    participation_methods: methods.map((method) =>
      single(method.value, method.label)
    ),
    visibility: visibilities.map((visibility) =>
      single(visibility, formatMessage(ACCESS_MESSAGES[visibility]))
    ),
    discoverability: [
      single('listed', formatMessage(messages.shownInLists)),
      single('unlisted', formatMessage(messages.byLinkOnly)),
    ],
    space_ids: spaces.options.map((space) => single(space.value, space.label)),
  };
  // A disabled query isn't loading, so this only counts the lists asked for.
  const isLoading = managers.isLoading || spaces.isLoading || folders.isLoading;

  return { options, isLoading };
};

export default useFacetOptions;
