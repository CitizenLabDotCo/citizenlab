import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import useLocalize from 'hooks/useLocalize';
import useProjectFolders from 'api/project_folders/useProjectFolders';
import { generateOptions } from './utils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string[]) => void;
}

const ProjectFolderValuesSelector = ({ value, onChange }: Props) => {
  const { data: projectFolders } = useProjectFolders({});
  const localize = useLocalize();

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    onChange(optionIds);
  };

  return (
    <MultipleSelect
      value={value}
      options={generateOptions(localize, projectFolders?.data)}
      onChange={handleOnChange}
    />
  );
};

export default ProjectFolderValuesSelector;
