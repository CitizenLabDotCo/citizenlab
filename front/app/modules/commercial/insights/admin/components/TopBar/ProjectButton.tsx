import React from 'react';

// styles
import { fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import { Button, Icon } from 'cl2-component-library';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProject from 'hooks/useProject';
import useLocale from 'hooks/useLocale';

interface ProjectButtonProps {
  projectId: string;
}

const ProjectButtonContent = styled.span`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .linkIcon {
    width: 20px;
    margin-left: 8px;
  }
`;

const ProjectButton = ({ projectId }: ProjectButtonProps) => {
  const locale = useLocale();

  const project = useProject({
    projectId,
  });

  if (isNilOrError(project) || isNilOrError(locale)) {
    return null;
  }

  return (
    <Button
      locale={locale}
      buttonStyle="secondary-outlined"
      linkTo={`/projects/${project.attributes.slug}`}
      fontSize={`${fontSizes.small}px`}
      padding="4px 6px"
    >
      <ProjectButtonContent>
        <T value={project.attributes.title_multiloc} />
        <Icon name="link" className="linkIcon" />
      </ProjectButtonContent>
    </Button>
  );
};

export default ProjectButton;
