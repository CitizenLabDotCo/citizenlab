import React, { useState } from 'react';

import { Box, IconNames } from '@citizenlab/cl2-component-library';

import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import { WHOLE_LIST_SIZE } from '../constants';
import FlyoutSearch from '../Menu/FlyoutSearch';
import MenuRow from '../Menu/MenuRow';
import moveMenuFocus from '../Menu/moveMenuFocus';
import NothingToChoose from '../Menu/NothingToChoose';
import useFocusFirst from '../Menu/useFocusFirst';
import messages from '../messages';

import {
  Destination,
  Placement,
  getDestinations,
  getHereKey,
} from './destinations';

const ICONS: Record<Destination['kind'], IconNames | undefined> = {
  space: 'spaces',
  folder: 'folder-outline',
  none: undefined,
};

interface Props {
  item: 'project' | 'folder';
  here: Placement;
  takeFocus: boolean;
  onPick: (destination: Destination) => void;
}

// The places an item can go, beside "⋯ › Move to". Its lists load when it
// opens.
const MoveToFlyout = ({ item, here, takeFocus, onPick }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [query, setQuery] = useState('');
  const focusFirst = useFocusFirst(takeFocus, 'input, button');

  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const canListSpaces = usePermission({ item: 'space', action: 'list' });
  const canListFolders = usePermission({
    item: 'project_folder',
    action: 'list_for_admin',
  });
  const isAdmin = usePermission({
    item: 'project',
    action: 'list_all_for_admin',
  });

  const showSpaces = spacesEnabled && canListSpaces;
  const spaces = useSpaces({}, { enabled: showSpaces });
  // Every folder this user can manage, as the Folders filter loads them.
  const folders = useInfiniteProjectFoldersAdmin({}, WHOLE_LIST_SIZE, {
    enabled: item === 'project' && canListFolders,
  });

  const destinations = getDestinations({
    item,
    spaces: showSpaces
      ? (spaces.data?.data ?? []).map((space) => ({
          id: space.id,
          title: localize(space.attributes.title_multiloc),
        }))
      : [],
    folders: (folders.data?.pages[0].data ?? []).map((folder) => ({
      id: folder.id,
      title: localize(folder.attributes.title_multiloc),
      spaceId: folder.attributes.space_id,
    })),
    isAdmin,
    noneLabel: formatMessage(
      spacesEnabled ? messages.noSpace : messages.notInAFolder
    ),
  });
  const hereKey = getHereKey(here);
  const shown = destinations.filter((destination) =>
    destination.label.toLowerCase().includes(query.trim().toLowerCase())
  );
  const isLoading = spaces.isLoading || folders.isLoading;

  return (
    <Box ref={focusFirst} onKeyDown={moveMenuFocus}>
      <FlyoutSearch
        count={destinations.length}
        value={query}
        onChange={setQuery}
        placeholder={formatMessage(messages.searchDestinations)}
        label={formatMessage(messages.searchDestinationsLabel)}
      />
      {shown.length === 0 && !isLoading && <NothingToChoose />}
      {/* The menu holds the destinations alone, not the search box above
          them. */}
      {shown.length > 0 && (
        <Box role="menu" aria-label={formatMessage(messages.moveTo)}>
          {shown.map((destination) => (
            <MenuRow
              key={destination.key}
              icon={ICONS[destination.kind]}
              label={destination.label}
              detail={destination.detail}
              current={destination.key === hereKey}
              onClick={() => onPick(destination)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MoveToFlyout;
