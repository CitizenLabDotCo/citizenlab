import React, { memo } from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import useLocalize from 'hooks/useLocalize';
import MultipleSelect from 'components/UI/MultipleSelect';
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string[]) => void;
  projects: GetProjectsChildProps;
}

const ProjectValuesSelector = memo(({ value, onChange, projects }: Props) => {
  const localize = useLocalize();
  const generateOptions = (): IOption[] => {
    if (!isNilOrError(projects) && projects.projectsList) {
      return projects.projectsList.map((project) => ({
        value: project.id,
        label: localize(project.attributes.title_multiloc),
      }));
    } else {
      return [];
    }
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
});

export default (inputProps) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']}>
    {(projects) => (
      <ProjectValuesSelector {...inputProps} projects={projects} />
    )}
  </GetProjects>
);
