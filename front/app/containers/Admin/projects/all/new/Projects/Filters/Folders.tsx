import React from 'react';

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
  const { data } = useProjectFolders({});

  const folderOptions: IFilterSelectorValue[] =
    data?.data.map((folder) => ({
      value: folder.id,
      text: localize(folder.attributes.title_multiloc),
    })) ?? [];

  return (
    <FilterSelector
      title={formatMessage(messages.folders)}
      name="folders"
      values={folderOptions}
      onChange={onChange}
      multipleSelectionAllowed
      selected={folderIds}
      filterSelectorStyle="text"
    />
  );
};

export default Folders;
