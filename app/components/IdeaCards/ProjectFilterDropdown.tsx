import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

// components
import FilterSelector from 'components/FilterSelector';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import localize, { InjectedLocalized } from 'utils/localize';

type DataProps = {
  projects: GetProjectsChildProps;
};

type InputProps = {
  id?: string | undefined;
  onChange: (value: any) => void;
};

type Props = InputProps & DataProps;

type State = {
  selectedValues: string[];
};

class ProjectFilterDropdown extends PureComponent<
  Props & InjectedLocalized,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      selectedValues: [],
    };
  }

  handleOnChange = (selectedValues) => {
    this.setState({ selectedValues });
    this.props.onChange(selectedValues);
  };

  render() {
    const { selectedValues } = this.state;
    const { projects, localize } = this.props;
    const projectsList = projects.projectsList;

    if (projectsList && projectsList.length > 0) {
      const options = projectsList.map((project) => {
        return {
          text: localize(project.attributes.title_multiloc),
          value: project.id,
        };
      });

      if (options && options.length > 0) {
        return (
          <FilterSelector
            id="e2e-project-filter-selector"
            title={<FormattedMessage {...messages.projectFilterTitle} />}
            name="projects"
            selected={selectedValues}
            values={options}
            onChange={this.handleOnChange}
            multipleSelectionAllowed={true}
            right="-10px"
            mobileLeft="-5px"
          />
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  projects: <GetProjects publicationStatuses={['published']} sort="new" />,
});

const ProjectFilterDropdownWithLocalize = localize(ProjectFilterDropdown);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <ProjectFilterDropdownWithLocalize {...dataProps} {...inputProps} />
    )}
  </Data>
);
