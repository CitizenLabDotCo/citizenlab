import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useProjectFolders from 'api/project_folders/useProjectFolders';

import useLocalize from 'hooks/useLocalize';

import { TRule } from '../rules';

import { generateOptions } from './utils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string) => void;
}

const ProjectFolderValueSelector = ({ value, onChange }: Props) => {
  const { data: projectFolders } = useProjectFolders({});
  const localize = useLocalize();

  const handleOnChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Select
      value={value}
      options={generateOptions(localize, projectFolders?.data)}
      onChange={handleOnChange}
    />
  );
};

export default ProjectFolderValueSelector;
