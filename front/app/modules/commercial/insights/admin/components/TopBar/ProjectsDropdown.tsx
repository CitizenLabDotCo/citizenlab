import React, { useState } from 'react';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import {
  Dropdown,
  DropdownListItem,
  Icon,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Link from 'utils/cl-router/Link';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// hooks
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError } from 'utils/helperUtils';

const DropdownWrapper = styled.div``;

const StyledIcon = styled(Icon)`
  width: 10px;
  margin-left: 8px;
`;

const StyledDropdownListItem = styled(DropdownListItem)`
  &:hover {
    a {
      color: black;
    }
  }
`;

const StyledLink = styled(Link)`
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  color: ${colors.label};
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
}: Props & InjectedIntlProps) => {
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
        fontSize={`${fontSizes.small}px`}
        padding="4px 6px"
        data-testid="insightsProjectDropdown"
        icon="link"
        iconPos="left"
        mr="12px"
        onClick={toggleDropdown}
      >
        {formatMessage(messages.linkedProjects, {
          numberOfProjects: projectIds.length,
        })}
        <StyledIcon name="dropdown" ariaHidden />
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
