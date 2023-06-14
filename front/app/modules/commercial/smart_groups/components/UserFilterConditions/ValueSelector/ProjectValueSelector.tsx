import React, { memo } from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { Select } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string) => void;
  projects: GetProjectsChildProps;
}

const ProjectValueSelector = memo(({ value, onChange, projects }: Props) => {
  const localize = useLocalize();
  const generateOptions = (): IOption[] => {
    if (!isNilOrError(projects)) {
      return projects.map((project) => {
        return {
          value: project.id,
          label: localize(project.attributes.title_multiloc),
        };
      });
    } else {
      return [];
    }
  };

  const handleOnChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Select
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
});

export default (inputProps: Props) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']}>
    {(projects) => <ProjectValueSelector {...inputProps} projects={projects} />}
  </GetProjects>
);
