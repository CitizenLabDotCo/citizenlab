import React from 'react';

import { IOption } from 'typings';

import useProjectFolders from 'api/project_folders/useProjectFolders';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { TRule } from '../rules';

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
