import React from 'react';

// styles
import { fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import { Icon } from 'cl2-component-library';
import Button from 'components/UI/Button';
import T from 'components/T';
import Link from 'utils/cl-router/Link';

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
      <Link to={`/projects/${project.attributes.slug}`} target="_blank">
        <Button
          buttonStyle="secondary-outlined"
          fontSize={`${fontSizes.small}px`}
          padding="4px 6px"
        >
          <ProjectButtonContent>
            <T value={project.attributes.title_multiloc} />
            <Icon name="link" className="linkIcon" />
          </ProjectButtonContent>
        </Button>
      </Link>
    </div>
  );
};

export default ProjectButton;
