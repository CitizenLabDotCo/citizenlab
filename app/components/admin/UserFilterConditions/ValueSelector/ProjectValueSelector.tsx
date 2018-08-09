import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import Select from 'components/UI/Select';
import localize, { injectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  projects: GetProjectsChildProps;
  tFunc: any;
};

type State = {};

class ProjectValueSelector extends React.PureComponent<Props & injectedLocalized, State> {

  generateOptions = (): IOption[] => {
    const { projects, localize } = this.props;

    if (!isNilOrError(projects) && projects.projectsList) {
      return projects.projectsList.map((project) => (
        {
          value: project.id,
          label: localize(project.attributes.title_multiloc),
        }
      ));
    } else {
      return [];
    }
  }

  handleOnChange = (option: IOption) => {
    this.props.onChange(option.value);
  }

  render() {
    const { value } = this.props;

    return (
      <Select
        value={value}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
        clearable={false}
      />
    );
  }
}

const AreaValueSelectorWithHOC = localize(ProjectValueSelector);

export default (inputProps) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']}>
    {(projects) => <AreaValueSelectorWithHOC {...inputProps} projects={projects} />}
  </GetProjects>
);
