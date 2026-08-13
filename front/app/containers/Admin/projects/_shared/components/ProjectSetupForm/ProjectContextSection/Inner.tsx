import React from 'react';

import { Box, Error, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import Highlighter from 'components/Highlighter';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';

import messages from './messages';
import { Props } from './types';

// Sentinel for the "no space" / "no folder" options. It must not be a valid id,
// and it cannot be an empty string, because that already has a different
// meaning inside of the Select component.
const NONE = '/';

// A select has nothing to page through, so the folders are fetched as a single
// page big enough to hold every folder the user manages.
const FOLDERS_PAGE_SIZE = 10000;

// Every option value below is built here, so it is always one of our ids.
const toId = (value: string): string | null => (value === NONE ? null : value);

// The API returns folders newest-first, which is no help in a select.
const byLabel = (a: IOption, b: IOption) => a.label.localeCompare(b.label);

const Inner = ({
  spaceId,
  folderId,
  projectInRoot,
  error,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const userIsAdmin = isAdmin(authUser);
  // Folder managers cannot manage spaces, so for them the space is never
  // something to pick: it always follows from the folder they select.
  const showSpaceSelect =
    spacesEnabled && (userIsAdmin || isSpaceModerator(authUser));

  // Both endpoints only return what the current user is allowed to manage.
  const { data: spaces } = useSpaces();
  const { data: folderPages } = useInfiniteProjectFoldersAdmin(
    {},
    FOLDERS_PAGE_SIZE
  );

  if (!folderPages) return null;
  if (showSpaceSelect && !spaces) return null;

  const folders = folderPages.pages.flatMap((page) => page.data);
  const selectedFolder = folders.find((folder) => folder.id === folderId);

  const spaceOptions: IOption[] = [
    { value: NONE, label: formatMessage(messages.noSpace) },
    ...(spaces?.data ?? [])
      .map((space) => ({
        value: space.id,
        label: localize(space.attributes.title_multiloc),
      }))
      .sort(byLabel),
  ];

  // A folder the user manages directly can sit in a space they do not manage.
  // Add that space so the select shows its name instead of rendering blank.
  if (spaceId && !spaceOptions.some((option) => option.value === spaceId)) {
    spaceOptions.push({
      value: spaceId,
      label: localize(selectedFolder?.attributes.space_title_multiloc),
    });
  }

  // Without a space, every folder stays selectable: that is how someone who
  // does not know which space a folder is in can start from the folder.
  const selectableFolders = spaceId
    ? folders.filter((folder) => folder.attributes.space_id === spaceId)
    : folders;

  const folderOptions: IOption[] = [
    { value: NONE, label: formatMessage(messages.noFolder) },
    ...selectableFolders
      .map((folder) => {
        const folderTitle = localize(folder.attributes.title_multiloc);
        const spaceTitle = folder.attributes.space_title_multiloc;

        // Naming the space makes it obvious why selecting the folder fills in
        // the space select above. Once a space is picked the list is already
        // narrowed down to it, so repeating it would just be noise.
        return {
          value: folder.id,
          label:
            showSpaceSelect && !spaceId && spaceTitle
              ? formatMessage(messages.folderInSpaceOption, {
                  folderTitle,
                  spaceTitle: localize(spaceTitle),
                })
              : folderTitle,
        };
      })
      .sort(byLabel),
  ];

  const handleSpaceChange = ({ value }: IOption) => {
    const newSpaceId = toId(value);
    // The folder select below only lists folders of the selected space, so a
    // folder that is not in it has to go.
    const keptFolder =
      selectedFolder?.attributes.space_id === newSpaceId
        ? selectedFolder
        : undefined;

    onChange({ space_id: newSpaceId, folder_id: keptFolder?.id ?? null });
  };

  const handleFolderChange = ({ value }: IOption) => {
    const newFolderId = toId(value);

    if (newFolderId === null) {
      // Keep the space the user picked themselves: removing the folder should
      // not also take the project out of its space. Without a space select the
      // space only ever came from the folder, so there it clears too.
      const remainingSpaceId = showSpaceSelect ? spaceId ?? null : null;
      onChange({ space_id: remainingSpaceId, folder_id: null });
      return;
    }

    const folder = folders.find(({ id }) => id === newFolderId);
    onChange({
      space_id: folder?.attributes.space_id ?? null,
      folder_id: newFolderId,
    });
  };

  // A project outside of every space and folder needs admin approval before a
  // manager can publish it. Admins never see this, and neither does anyone
  // editing a project that has to stay in a space or folder anyway.
  const showApprovalWarning =
    !userIsAdmin && projectInRoot && !spaceId && !folderId;

  return (
    <Box display="flex" flexDirection="column" gap="20px">
      {showSpaceSelect && (
        <Select
          id="project-context-space-select"
          label={formatMessage(messages.spaceLabel)}
          labelTooltipText={formatMessage(messages.spaceTooltip)}
          value={spaceId ?? NONE}
          options={spaceOptions}
          onChange={handleSpaceChange}
          dataCy="space-select"
        />
      )}
      <Highlighter fragmentId={folderFragmentId}>
        <Select
          id="project-context-folder-select"
          label={formatMessage(messages.folderLabel)}
          value={folderId ?? NONE}
          options={folderOptions}
          onChange={handleFolderChange}
          dataCy="project-folder-select"
        />
      </Highlighter>
      {error && (
        <Error
          text={formatMessage(
            showSpaceSelect
              ? messages.canOnlyMoveToManagedSpaceOrFolder
              : messages.canOnlyMoveToManagedFolder
          )}
        />
      )}
      {showApprovalWarning && (
        <Warning>
          <FormattedMessage
            {...(showSpaceSelect
              ? messages.approvalNeededWithSpaces
              : messages.approvalNeededWithoutSpaces)}
          />
        </Warning>
      )}
    </Box>
  );
};

export default Inner;
