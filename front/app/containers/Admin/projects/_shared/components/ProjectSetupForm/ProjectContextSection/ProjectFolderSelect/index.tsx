import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { SpaceAndFolderId } from '../types';

import messages from './messages';

interface Props {
  folder_id?: string | null;
  onChange: (spaceAndFolderId: SpaceAndFolderId) => void;
}

const ProjectFolderSelect = ({ folder_id, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: projectFolders } = useInfiniteProjectFoldersAdmin({}, 10000);

  const noFolderId = '/'; // This sentinel must not be a valid folder id.
  const noFolderLabel = formatMessage(messages.noFolderLabel);
  const noFolderOption = { value: noFolderId, label: noFolderLabel };

  const flatFolders = projectFolders?.pages.flatMap((page) => page.data);
  const folderOptions: IOption[] = flatFolders
    ? [
        noFolderOption,
        ...flatFolders
          .map((folder) => ({
            value: folder.id,
            label: localize(folder.attributes.title_multiloc),
          }))
          .sort((a, b) =>
            a.label.localeCompare(b.label, undefined, {
              sensitivity: 'base',
              numeric: true,
            })
          ),
      ]
    : [];

  const handleSelectFolderChange = ({ value: folderId }) => {
    if (folderId) {
      const selectedFolder = flatFolders?.find(
        (folder) => folder.id === folderId
      );
      const spaceId = selectedFolder?.attributes.space_id ?? null;
      onChange({ space_id: spaceId, folder_id: folderId });
    } else {
      onChange({ space_id: null, folder_id: null });
    }
  };

  if (folderOptions.length === 0) return null;

  const defaultFolderSelectOptionValue = folderOptions[0].value;

  return (
    <Select
      value={folder_id || defaultFolderSelectOptionValue}
      options={folderOptions}
      onChange={handleSelectFolderChange}
    />
  );
};

export default ProjectFolderSelect;
