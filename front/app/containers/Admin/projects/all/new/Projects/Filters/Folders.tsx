import React, { useRef } from 'react';

import useProjectFolders from 'api/project_folders/useProjectFolders';

import useLocalize from 'hooks/useLocalize';

import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  folderIds: string[];
  onChange: (folderIds: string[]) => void;
}

const Folders = ({ folderIds, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  // Disabled by default because we want to only make the request when the user opens the dropdown
  // This prevents unnecessary requests when the component is mounted and the user doesn't interact with it
  const { data, isLoading, refetch } = useProjectFolders({}, false);
  const hasFetchedRef = useRef(false);

  const folderOptions: IFilterSelectorValue[] =
    data?.data.map((folder) => ({
      value: folder.id,
      text: localize(folder.attributes.title_multiloc),
    })) ?? [];

  const handleOpen = () => {
    if (!hasFetchedRef.current) {
      refetch();
      hasFetchedRef.current = true;
    }
  };

  return (
    <FilterSelector
      title={formatMessage(messages.folders)}
      name="folders"
      values={folderOptions}
      onChange={onChange}
      multipleSelectionAllowed
      selected={folderIds}
      filterSelectorStyle="text"
      isLoading={isLoading}
      onOpen={handleOpen}
    />
  );
};

export default Folders;
