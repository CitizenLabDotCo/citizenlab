import React, { memo } from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { Select } from 'cl2-component-library';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  projects: GetProjectsChildProps;
}

const ProjectValueSelector = memo(
  ({ value, onChange, projects, localize }: Props & InjectedLocalized) => {
    const generateOptions = (): IOption[] => {
      if (!isNilOrError(projects) && projects.projectsList) {
        return projects.projectsList.map((project) => {
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
  }
);

const ProjectValueSelectorWithHOC = localize(ProjectValueSelector);

export default (inputProps: Props) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']}>
    {(projects) => (
      <ProjectValueSelectorWithHOC {...inputProps} projects={projects} />
    )}
  </GetProjects>
);
