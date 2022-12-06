import React, { useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
// styling
import styled from 'styled-components';
// components
import {
  Dropdown,
  DropdownListItem,
  Icon,
  Box,
} from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
// hooks
import useProject from 'hooks/useProject';
// intl
import { injectIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
// utils
import { isNilOrError } from 'utils/helperUtils';
import { colors, fontSizes } from 'utils/styleUtils';
import Button from 'components/UI/Button';
import messages from './messages';

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
  const project = useProject({ projectId });
  const localize = useLocalize();

  if (isNilOrError(project)) return null;

  return (
    <StyledDropdownListItem>
      <StyledLink to={`/projects/${project.attributes.slug}`} target="_blank">
        {localize(project.attributes.title_multiloc)}
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
