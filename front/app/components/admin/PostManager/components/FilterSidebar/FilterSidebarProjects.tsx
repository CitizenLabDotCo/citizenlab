import React from 'react';
import { IProjectData } from 'services/projects';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarProjectsItem from './FilterSidebarProjectsItem';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

interface Props {
  projects?: IProjectData[] | null;
  selectedProject?: string | null;
  onChangeProjectFilter?: (project: string[] | undefined) => void;
}

class FilterSidebarProjects extends React.PureComponent<Props> {
  handleItemClick = (id: string) => () => {
    const projectIds = [id];
    this.props.onChangeProjectFilter &&
      this.props.onChangeProjectFilter(projectIds);
  };

  clearFilter = () => {
    this.props.onChangeProjectFilter &&
      this.props.onChangeProjectFilter(undefined);
  };

  isActive = (id) => {
    return this.props.selectedProject && this.props.selectedProject === id;
  };

  render() {
    return (
      <Menu secondary={true} vertical={true} fluid={true}>
        {!(this.props.projects && this.props.projects.length === 1) && (
          <>
            <Menu.Item
              onClick={this.clearFilter}
              active={!this.props.selectedProject}
            >
              <FormattedMessage {...messages.allProjects} />
            </Menu.Item>
            <Divider />
          </>
        )}
        {this.props.projects &&
          this.props.projects.map((project) => (
            <FilterSidebarProjectsItem
              key={project.id}
              project={project}
              active={!!this.isActive(project.id)}
              onClick={this.handleItemClick(project.id)}
            />
          ))}
      </Menu>
    );
  }
}

export default FilterSidebarProjects;
