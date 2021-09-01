import React from 'react';
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

class ProjectValueSelector extends React.PureComponent<
  Props & InjectedLocalized
> {
  generateOptions = (): IOption[] => {
    const { projects, localize } = this.props;

    if (!isNilOrError(projects) && projects.projectsList) {
      return projects.projectsList.map((project) => ({
        value: project.id,
        label: localize(project.attributes.title_multiloc),
      }));
    } else {
      return [];
    }
  };

  handleOnChange = (option: IOption) => {
    this.props.onChange(option.value);
  };

  render() {
    const { value } = this.props;

    return (
      <Select
        value={value}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
      />
    );
  }
}

const ProjectValueSelectorWithHOC = localize(ProjectValueSelector);

export default (inputProps: Props) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']}>
    {(projects) => (
      <ProjectValueSelectorWithHOC {...inputProps} projects={projects} />
    )}
  </GetProjects>
);
