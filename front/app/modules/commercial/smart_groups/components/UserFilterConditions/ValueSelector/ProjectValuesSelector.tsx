import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import MultipleSelect from 'components/UI/MultipleSelect';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  projects: GetProjectsChildProps;
};

type State = {};

class ProjectValuesSelector extends React.PureComponent<
  Props & InjectedLocalized,
  State
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

  handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    this.props.onChange(optionIds);
  };

  render() {
    const { value } = this.props;

    return (
      <MultipleSelect
        value={value}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
      />
    );
  }
}

const ProjectValuesSelectorWithHOC = localize(ProjectValuesSelector);

export default (inputProps) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']}>
    {(projects) => (
      <ProjectValuesSelectorWithHOC {...inputProps} projects={projects} />
    )}
  </GetProjects>
);
