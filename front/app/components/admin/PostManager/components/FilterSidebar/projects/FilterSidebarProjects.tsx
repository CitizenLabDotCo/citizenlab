import React from 'react';

import { Box, Divider, Text } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';
import FilterRadioButton from '../FilterRadioButton';

import FilterSidebarProjectsItem from './FilterSidebarProjectsItem';

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

  const name = 'projects';

  return (
    <Box display="flex" flexDirection="column">
      {!(projects && projects.length === 1) && (
        <>
          {/* FilterRadioButton is also used inside FilterSidebarProjectsItem */}
          <FilterRadioButton
            id="all-projects"
            labelContent={<FormattedMessage {...messages.allProjects} />}
            name={name}
            onChange={clearFilter}
            isSelected={!selectedProject}
          />
          <Divider />
        </>
      )}
      <Box display="inline-flex">
        <ButtonWithLink
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
        </ButtonWithLink>
      </Box>
      {projects &&
        projects.map((project) => (
          <FilterSidebarProjectsItem
            key={project.id}
            project={project}
            active={isActive(project.id)}
            onClick={handleItemClick(project.id)}
            name={name}
          />
        ))}
    </Box>
  );
};

export default FilterSidebarProjects;
