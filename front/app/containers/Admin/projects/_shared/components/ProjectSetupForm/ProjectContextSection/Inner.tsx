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
import { Props, FormSituation } from './types';

// Sentinel for the "no space" / "no folder" options. It must not be a valid id,
// and it cannot be an empty string, because that already has a different
// meaning inside of the Select component.
const NONE = '/';

const toId = (value: unknown): string | null =>
  typeof value === 'string' && value !== NONE ? value : null;

const byLabel = (a: IOption, b: IOption) =>
  a.label.localeCompare(b.label, undefined, {
    sensitivity: 'base',
    numeric: true,
  });

const Inner = ({
  space_id,
  folder_id,
  error,
  formSituation,
  onChange,
}: Props & {
  formSituation: FormSituation;
}) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const userIsAdmin = isAdmin(authUser);
  // Folder managers cannot manage spaces, so for them the space is never
  // something to pick: it always follows from the folder they select.
  const showSpaceSelect =
    spacesEnabled && (userIsAdmin || isSpaceModerator(authUser));

  const { data: spaces } = useSpaces({}, { enabled: showSpaceSelect });
  // Both endpoints only return what the current user is allowed to manage.
  const { data: folderPages } = useInfiniteProjectFoldersAdmin({}, 10000);

  if (!folderPages) return null;
  if (showSpaceSelect && !spaces) return null;

  const folders = folderPages.pages.flatMap((page) => page.data);
  const selectedFolder = folders.find((folder) => folder.id === folder_id);

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
  if (space_id && !spaceOptions.some((option) => option.value === space_id)) {
    spaceOptions.push({
      value: space_id,
      label: localize(selectedFolder?.attributes.space_title_multiloc),
    });
  }

  // Without a space, every folder stays selectable: that is how someone who
  // does not know which space a folder is in can start from the folder.
  const selectableFolders = space_id
    ? folders.filter((folder) => folder.attributes.space_id === space_id)
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
            showSpaceSelect && !space_id && spaceTitle
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
      const remainingSpaceId = showSpaceSelect ? space_id ?? null : null;
      onChange({ space_id: remainingSpaceId, folder_id: null });
      return;
    }

    const folder = folders.find(({ id }) => id === newFolderId);
    onChange({
      space_id: folder?.attributes.space_id ?? null,
      folder_id: newFolderId,
    });
  };

  const showApprovalWarning =
    formSituation === 'creating' && !userIsAdmin && !space_id && !folder_id;

  return (
    <Box display="flex" flexDirection="column" gap="20px">
      {showSpaceSelect && (
        <Select
          id="project-context-space-select"
          label={formatMessage(messages.spaceLabel)}
          labelTooltipText={formatMessage(messages.spaceTooltip)}
          value={space_id ?? NONE}
          options={spaceOptions}
          onChange={handleSpaceChange}
          dataCy="space-select"
        />
      )}
      <Highlighter fragmentId={folderFragmentId}>
        <Select
          id="project-context-folder-select"
          label={formatMessage(messages.folderLabel)}
          value={folder_id ?? NONE}
          options={folderOptions}
          onChange={handleFolderChange}
          dataCy="project-folder-select"
        />
      </Highlighter>
      {error && (
        <Error
          text={formatMessage(
            showSpaceSelect ? messages.spaceOrFolderError : messages.folderError
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
