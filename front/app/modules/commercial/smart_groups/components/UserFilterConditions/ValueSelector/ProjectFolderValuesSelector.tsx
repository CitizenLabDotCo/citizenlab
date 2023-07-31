import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import useLocalize from 'hooks/useLocalize';
import useProjectFolders from 'api/project_folders/useProjectFolders';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string[]) => void;
}

const ProjectFolderValuesSelector = ({ value, onChange }: Props) => {
  const { data: projectFolders } = useProjectFolders({});
  const localize = useLocalize();

  const generateOptions = (): IOption[] => {
    if (projectFolders?.data) {
      return projectFolders.data.map((projectFolder) => {
        return {
          value: projectFolder.id,
          label: localize(projectFolder.attributes.title_multiloc),
        };
      });
    }
    return [];
  };

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    onChange(optionIds);
  };

  return (
    <MultipleSelect
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
};

export default ProjectFolderValuesSelector;
