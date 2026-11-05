import React from 'react';

import useProjectFolders from 'api/project_folders/useProjectFolders';

import useLocalize from 'hooks/useLocalize';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { useParam, setParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

interface Props {
  onClear: () => void;
}

const Folders = ({ onClear }: Props) => {
  const folderIds = useParam('folder_ids') ?? [];
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data, isLoading } = useProjectFolders({});

  const folderOptions =
    data?.data.map((folder) => ({
      value: folder.id,
      label: localize(folder.attributes.title_multiloc),
    })) ?? [];

  return (
    <MultiSelect
      title={formatMessage(messages.folders)}
      options={folderOptions}
      selected={folderIds}
      isLoading={isLoading}
      openedDefaultValue={folderIds.length === 0}
      onChange={(folderIds) => {
        setParam('folder_ids', folderIds);
        trackEventByName(tracks.setFolder, {
          folderIds: JSON.stringify(folderIds),
        });
      }}
      onClear={onClear}
    />
  );
};

export default Folders;
