import React, { useState } from 'react';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// components
import {
  Dropdown,
  DropdownListItem,
  Icon,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError } from 'utils/helperUtils';

const DropdownWrapper = styled.div``;

const StyledIcon = styled(Icon)`
  width: ${fontSizes.xs}px;
  margin-left: 8px;
`;

interface ProjectTitleProps {
  projectId: string;
}

const ProjectTitle = ({ projectId }: ProjectTitleProps) => {
  const project = useProject({ projectId });
  const localize = useLocalize();

  if (isNilOrError(project)) return null;

  const NOOP = () => {};

  return (
    <DropdownListItem onClick={NOOP}>
      {localize(project.attributes.title_multiloc)}
    </DropdownListItem>
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
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

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
        icon="link"
        iconPos="left"
        openLinkInNewTab
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
