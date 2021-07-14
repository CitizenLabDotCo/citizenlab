import React from 'react';

// styles
import { fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import { Icon } from 'cl2-component-library';
import Button from 'components/UI/Button';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProject from 'hooks/useProject';

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
  const project = useProject({
    projectId,
  });

  if (isNilOrError(project)) {
    return null;
  }

  return (
    <div data-testid="insightsProjectButton">
      <Button
        buttonStyle="secondary-outlined"
        fontSize={`${fontSizes.small}px`}
        padding="4px 6px"
        linkTo={`/projects/${project.attributes.slug}`}
      >
        <ProjectButtonContent>
          <T value={project.attributes.title_multiloc} />
          <Icon name="link" className="linkIcon" />
        </ProjectButtonContent>
      </Button>
    </div>
  );
};

export default ProjectButton;
