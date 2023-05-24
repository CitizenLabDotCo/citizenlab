import React from 'react';
import { IProjectData } from 'api/projects/types';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarProjectsItem from './FilterSidebarProjectsItem';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { isNilOrError } from 'utils/helperUtils';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import useAuthUser from 'hooks/useAuthUser';

interface Props {
  projects?: IProjectData[] | null;
  selectedProject?: string | null;
  onChangeProjectFilter?: (project: string[] | undefined) => void;
}

const FilterSidebarProjects = ({
  projects,
  selectedProject,
  onChangeProjectFilter,
}: Props) => {
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const handleItemClick = (id: string) => () => {
    const projectIds = [id];
    onChangeProjectFilter && onChangeProjectFilter(projectIds);
  };

  const clearFilter = () => {
    onChangeProjectFilter && onChangeProjectFilter(undefined);
  };

  const isActive = (id: string) => {
    return selectedProject === id;
  };

  return (
    <Menu secondary={true} vertical={true} fluid={true}>
      {!(projects && projects.length === 1) && (
        <>
          <Menu.Item onClick={clearFilter} active={!selectedProject}>
            <FormattedMessage {...messages.allProjects} />
          </Menu.Item>
          <Divider />
        </>
      )}
      <Box display="inline-flex">
        <Button
          buttonStyle="text"
          icon="edit"
          pl="12px"
          linkTo="/admin/projects"
          iconPos="right"
          iconSize="14px"
        >
          <Text m="0px" color="coolGrey600" fontSize="s" textAlign="left">
            <FormattedMessage {...messages.editProjects} />
          </Text>
        </Button>
      </Box>
      {projects &&
        projects.map((project) => (
          <FilterSidebarProjectsItem
            key={project.id}
            project={project}
            active={isActive(project.id)}
            onClick={handleItemClick(project.id)}
          />
        ))}
    </Menu>
  );
};

export default FilterSidebarProjects;
