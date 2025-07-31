import React, { useRef } from 'react';

import useProjectFolders from 'api/project_folders/useProjectFolders';

import useLocalize from 'hooks/useLocalize';

import MultiSelect from 'components/UI/MultiSelect';

import { useIntl } from 'utils/cl-intl';

import { useParam, setParam } from '../../params';

import messages from './messages';

interface Props {
  onClear: () => void;
}

const Folders = ({ onClear }: Props) => {
  const folderIds = useParam('folder_ids') ?? [];
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  // Disabled by default because we want to only make the request when the user opens the dropdown
  // This prevents unnecessary requests when the component is mounted and the user doesn't interact with it
  const { data, isLoading, refetch } = useProjectFolders({}, false);
  const hasFetchedRef = useRef(false);

  const folderOptions =
    data?.data.map((folder) => ({
      value: folder.id,
      label: localize(folder.attributes.title_multiloc),
    })) ?? [];

  const handleOpen = () => {
    if (!hasFetchedRef.current) {
      refetch();
      hasFetchedRef.current = true;
    }
  };

  return (
    <MultiSelect
      title={formatMessage(messages.folders)}
      options={folderOptions}
      selected={folderIds}
      isLoading={isLoading}
      onOpen={handleOpen}
      onChange={(folderIds) => {
        setParam('folder_ids', folderIds);
      }}
      onClear={onClear}
    />
  );
};

export default Folders;
