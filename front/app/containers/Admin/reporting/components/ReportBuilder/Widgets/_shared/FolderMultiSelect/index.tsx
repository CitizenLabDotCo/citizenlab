import React, { useMemo } from 'react';

import useProjectFolders from 'api/project_folders/useProjectFolders';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import useAutoCleanupMultiSelect from '../useAutoCleanupMultiSelect';

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

const FolderMultiSelect = ({ value, onChange, placeholder }: Props) => {
  const localize = useLocalize();

  const { data: foldersData } = useProjectFolders({});

  const options = useMemo(() => {
    if (!foldersData) return [];

    return foldersData.data.map((folder) => ({
      value: folder.id,
      label: localize(folder.attributes.title_multiloc),
    }));
  }, [foldersData, localize]);

  const { selectedOptions, handleChange } = useAutoCleanupMultiSelect({
    value,
    options,
    onChange,
  });

  return (
    <MultipleSelect
      value={selectedOptions}
      options={options}
      onChange={handleChange}
      placeholder={placeholder}
      isSearchable={true}
    />
  );
};

export default FolderMultiSelect;
