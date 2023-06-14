import React, { useState } from 'react';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import {
  Dropdown,
  DropdownListItem,
  Icon,
  Box,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Link from 'utils/cl-router/Link';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';

const DropdownWrapper = styled.div``;

const StyledDropdownListItem = styled(DropdownListItem)`
  &:hover {
    a {
      color: black;
    }
  }
`;

const StyledLink = styled(Link)`
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  color: ${colors.textSecondary};
  text-align: left;
`;

interface ProjectTitleProps {
  projectId: string;
}

const ProjectTitle = ({ projectId }: ProjectTitleProps) => {
  const { data: project } = useProjectById(projectId);
  const localize = useLocalize();

  if (!project) return null;

  return (
    <StyledDropdownListItem>
      <StyledLink
        to={`/projects/${project.data.attributes.slug}`}
        target="_blank"
      >
        {localize(project.data.attributes.title_multiloc)}
      </StyledLink>
    </StyledDropdownListItem>
  );
};

interface Props {
  projectIds: string[];
}

const ProjectsDropdown = ({
  projectIds,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const [isDropdownOpened, setDropdownOpened] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  return (
    <DropdownWrapper>
      <Button
        buttonStyle="secondary-outlined"
        fontSize={`${fontSizes.s}px`}
        padding="4px 6px"
        data-testid="insightsProjectDropdown"
        icon="link"
        iconPos="left"
        mr="12px"
        onClick={toggleDropdown}
      >
        <Box as="span" display="flex" alignItems="center">
          {formatMessage(messages.linkedProjects, {
            numberOfProjects: projectIds.length,
          })}
          <Icon ml="4px" name="chevron-down" ariaHidden />
        </Box>
      </Button>
      <Dropdown
        opened={isDropdownOpened}
        onClickOutside={closeDropdown}
        className="dropdown"
        content={
          <>
            {projectIds.map((projectId) => (
              <ProjectTitle projectId={projectId} key={projectId} />
            ))}
          </>
        }
      />
    </DropdownWrapper>
  );
};

export default injectIntl(ProjectsDropdown);
